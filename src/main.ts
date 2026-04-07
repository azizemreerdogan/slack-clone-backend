import { buildServer } from "./utils/server.js";
import {env} from "./config/env.js" 


async function gracefulShutdown({
    app
}: {
    app: Awaited<ReturnType<typeof buildServer>>
}) {
    await app.close();
}

async function main() {
    const app = await buildServer()
    
    await app.listen(
        {
            port: env.PORT,
            host: env.HOST
        }
    );
    
    const signals : string[] = ['SIGINT', 'SIGTERM']
    

    
    for(const signal of signals){
        process.on(signal, () => {
            console.log("Got signal" , signal)
            
            gracefulShutdown({
                app
            })
        })
    }
    

    
    console.log("Server is running!")
}

main()