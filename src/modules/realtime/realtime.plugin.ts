import type { FastifyInstance } from "fastify";
import websocket from "@fastify/websocket"
import { registry } from "../realtime/realtime.registry.js"
import { handleCall } from "../realtime/realtime.handlers.js"
import prisma from "../../lib/prisma.js"
import { MemberStatus } from "../../../generated/prisma/enums.js";
import { raw } from "@prisma/client/runtime/client";

export async function realtimePlugin(app: FastifyInstance){
    await app.register(websocket);

    app.get("/ws", {websocket: true}, async (socket,req) => {
        //Auth from jwt (extract user_id)
        let user_id: string;
        try{    
            const payload = await req.jwtVerify<{id: string}>();
            user_id = payload.id;
        }catch(e){
            socket.close(1008, "unauthorized");
            return;
        }

        registry.add(user_id, socket)
        //All of the workspaceMembers associated with user will be ONLINE.
        await prisma.workspaceMember.updateMany({
            where: {user_id: user_id},
            data: {
                member_status: MemberStatus.ONLINE
            }
        })

        //Heartbeat (for cleaning zombie sockets)
        //Browser returns "pong" on ping
        let isAlive = true;
        socket.on("pong", () => {isAlive = true});

        const ping = setInterval(() => {
            if(!isAlive){
                socket.terminate();
                return;
            }
            isAlive = false;
            socket.ping();
        }, 30000)

        socket.on("message" , (raw : string) => {
            let message;
            
            try {
                message = JSON.parse(raw.toString());
            } catch (e) {
                socket.send(JSON.stringify({
                    type: "error",
                    error: "Invalid JSON"
                }));
                return;
            }

            const { type, payload } = message;

            if (typeof type !== "string") {
                socket.send(JSON.stringify({
                    type: "error",
                    error: "type is required"
                }));
                return;
            }

            if (type.startsWith("call.")) {
                handleCall({
                    user_id,
                    socket,
                    type,
                    payload: payload || {}
                });
            }
        })
        
        
        socket.on("close", () => {
            clearInterval(ping);
            const {wasLast} = registry.remove(user_id,socket);
            if(wasLast) {
                prisma.workspaceMember.updateMany({
                where: {user_id: user_id},
                data: {
                    member_status: MemberStatus.OFFLINE
                }
            })
            }
        })

    });

    


}