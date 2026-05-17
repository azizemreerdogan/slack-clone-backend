import { CallStatus, ParticipantStatus } from "../../../generated/prisma/enums.js";
import { AppError } from "../../errors/AppError.js"; 
import prisma from "../../lib/prisma.js"
import { bus } from "../../lib/events.js"


export async function inviteCall(user_id: string, workspace_member_id: string, recipients: string[], channel_id: string){
    if(recipients.length == 0){
        throw new AppError(404, "Recipient list cannot be empty")
    }

    const call = await prisma.callSession.create({
        data: {
            channel_id: channel_id,
            starter_id: workspace_member_id,
            status: CallStatus.RINGING,
        }
    })

    //Butun recipientlar id'leri ile db'ye yazılır.
    await prisma.callParticipant.createMany({
        data: recipients.map((id) => ({
            call_session_id: call.id,
            member_id: id,
            status: ParticipantStatus.INVITED
        }))
    })

    

    bus.emit("call.invite", {
        call_id: call.id,
        recipients: recipients,
        sender_id: user_id,
        workspace_member_id: workspace_member_id,
        created_at: call.started_at})
}

export async function acceptCall(call_id: string, user_id: string, workspace_member_id: string, channel_id: string){
    await prisma.callSession.update({
        where: {id: call_id},
        data: {status: CallStatus.ACTIVE}
    })

    const callParticipant = await prisma.callParticipant.create({
        data: {
            call_session_id: call_id,
            member_id: workspace_member_id, 
            status: ParticipantStatus.ACCEPTED
        }
    });

    bus.emit("call.accept", {
        call_id: call_id,
        user_id: user_id,
        workspace_member_id: workspace_member_id
    })

    return callParticipant;
}

export async function declineCall(call_id: string, user_id: string, workspace_member_id: string){

    let callEnded = false;
    await prisma.$transaction(async (tx) => {
        await tx.callParticipant.update({
            where: {
                call_session_id_member_id: {
                    call_session_id: call_id,
                    member_id: workspace_member_id
                }
            },
            data: {
                status: ParticipantStatus.DECLINED
            }
        })
        
        

        //Check if call has any participants if yes shut-down the call.
        const participants = await tx.callParticipant.findMany({
            where: {
                call_session_id: call_id,
                status: {
                    in: [ParticipantStatus.ACCEPTED, ParticipantStatus.INVITED]
                }
            },
            select: {id: true}
        })

        if(participants.length == 0){
            await tx.callSession.update({
                where: {id: call_id},
                data: {status: CallStatus.MISSED, ended_at: new Date()}
            });
            callEnded = true; 
            bus.emit("call.ended", {
                call_id: call_id,
                sender_id: user_id,
                workspace_member_id: workspace_member_id,
                recipients: participants.map((i) => i.id),
                ended_at: new Date()
            })
        }
    })

    if(callEnded){
        //call ended mesajı kime gidecek, starter ve recipiant idleri gerekli.
        const session = await prisma.callSession.findUnique({
            where: {id: call_id},
            include: {
                starter: {select: {user_id: true}},
                participants: {select: {member: true}}

            }
        })

        if(session){
            const recipients = [
                session.starter.user_id,
                ...session.participants.map((p) => p.member.user_id)
            ]

            bus.emit("call.ended", {
                call_id: call_id,
                sender_id: user_id,
                workspace_member_id: workspace_member_id,
                recipients: [...new Set(recipients)],
                ended_at: new Date()
            })
        }
    }

    bus.emit("call.decline", {
            call_id: call_id,
            user_id: user_id,
            workspace_member_id: workspace_member_id,
        })
}

export async function leaveCall(call_id: string, user_id: string, workspace_member_id: string){
    // 1-3 atomik: kişiyi LEFT yap, kalanları say, kimse yoksa çağrıyı bitir.
    const callEnded = await prisma.$transaction(async (tx) => {
        await tx.callParticipant.update({
            where: {
                call_session_id_member_id: {
                    call_session_id: call_id,
                    member_id: workspace_member_id
                }
            },
            data: {
                status: ParticipantStatus.LEFT,
                left_at: new Date()
            }
        })

        // Çağrıda hâlâ aktif/bekleyen biri var mı?
        const remaining = await tx.callParticipant.count({
            where: {
                call_session_id: call_id,
                status: { in: [ParticipantStatus.ACCEPTED, ParticipantStatus.INVITED] }
            }
        })

        if(remaining === 0){
            await tx.callSession.update({
                where: { id: call_id },
                data: { status: CallStatus.ENDED, ended_at: new Date() }
            })
            return true;
        }
        return false;
    })

    // Emit'ler transaction commit OLDUKTAN sonra — rollback olsa event uçmasın.
    bus.emit("call.leave", {
        call_id: call_id,
        user_id: user_id,
        created_at: new Date()
    })

    if(callEnded){
        // call.ended kime gidecek: starter + tüm katılımcıların user_id'leri.
        const session = await prisma.callSession.findUnique({
            where: { id: call_id },
            include: {
                starter: { select: { user_id: true } },
                participants: { include: { member: { select: { user_id: true } } } }
            }
        })

        if(session){
            const recipients = [
                session.starter.user_id,
                ...session.participants.map((p) => p.member.user_id)
            ]

            bus.emit("call.ended", {
                call_id: call_id,
                sender_id: user_id,
                workspace_member_id: workspace_member_id,
                recipients: [...new Set(recipients)],
                ended_at: new Date()
            })
        }
    }
}