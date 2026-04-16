import type { WebSocket } from '@fastify/websocket';

const connections = new Map<string, Set<WebSocket>>();

//For one user_id there can exists more than one connection, 
//Users can open more than one tab.

export const registry = {
    add(user_id: string, socket: WebSocket){
        let set = connections.get(user_id);

        if(!set){
            set = new Set<WebSocket>()
            connections.set(user_id,set);   
        }

        set.add(socket);
    },

    remove(user_id: string, socket: WebSocket) : {wasLast: boolean}{
        let set = connections.get(user_id);
        

        if(!set) {return {wasLast: false}}
        set.delete(socket);
        if(set.size === 0){
            connections.delete(user_id);
            return {wasLast: true};
        }
        return {wasLast: false};
        
    },

    isOnline(user_id: string) : boolean{
        return connections.has(user_id);
    },

    //Send all of the sockets available
    send(user_id: string, payload: unknown): void{
        const set = connections.get(user_id);
        if(!set) return;
        const data = JSON.stringify(payload);

        for(const socket of set){
            if(socket.readyState === socket.OPEN) socket.send(data);
        }
    }
}