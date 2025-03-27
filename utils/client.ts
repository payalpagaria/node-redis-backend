//to setup redis once for an all
import { createClient, type RedisClientType } from "redis";

let client:RedisClientType|null=null;

export async function InitializeClient() {
    if(!client){
        client=createClient()
        client.on("error",(error)=>{
            console.log(error)
        })
        client.on("connect",()=>{
            console.log("Redis connected")
        })
        await client.connect()
    }
    return client
}