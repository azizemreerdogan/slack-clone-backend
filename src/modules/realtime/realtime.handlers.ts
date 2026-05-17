import type { WebSocket } from "@fastify/websocket";
import { AcceptCallSchema, DeclineCallSchema, InviteCallSchema, LeaveCallSchema } from "../call/call.schema.js";
import { acceptCall, declineCall, inviteCall, leaveCall } from "../call/call.service.js";
import type { ZodSafeParseResult } from "zod";

 
export interface HandlerCtx {
    user_id: string;
    socket: WebSocket;
    type: string;
    payload: Record<string, unknown>;
}

type Handler = (ctx: HandlerCtx) => void | Promise<void>;

function validateParsing(socket: WebSocket, validation: ZodSafeParseResult<any>): boolean {
    if(!validation.success){
        socket.send(JSON.stringify({
                    type: "call.error",
                    error: "Invalid payload",
                    details: validation.error
                }));
                return false;
    }
    return true;
}

//call.* ile olan prefixler için handler yazıyoruz. İlgili service buradan çağrılacak.
export async function handleCall(ctx: HandlerCtx) {
    const { user_id, socket, type, payload } = ctx;

    switch(type) {
        case "call.invite": {
            const validation = InviteCallSchema.safeParse(payload);
            
            if (!validateParsing(socket, validation)) return;

            const { channel_id, recipients, workspace_member_id } = validation.data!;
            await inviteCall(user_id, workspace_member_id, recipients, channel_id)
            break;
        }
        case "call.accept": {
            const validation = AcceptCallSchema.safeParse(payload);

            if (!validateParsing(socket, validation)) return;

            const { call_id ,channel_id, workspace_member_id } = validation.data!;
            await acceptCall(call_id, user_id, workspace_member_id, channel_id);
            break;
        }
        case "call.decline": {
            const validation = DeclineCallSchema.safeParse(payload);

            if (!validateParsing(socket, validation)) return;

            const { call_id, workspace_member_id } = validation.data!
            await declineCall(call_id, user_id, workspace_member_id);
            break;
        }
        case "call.leave": {
            const validation = LeaveCallSchema.safeParse(payload);

            if (!validateParsing(socket, validation)) return;

            const { call_id, workspace_member_id } = validation.data!;
            leaveCall(call_id, user_id, workspace_member_id);
            break;
        }
    }
}