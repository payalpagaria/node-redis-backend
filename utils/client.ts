import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

export async function InitializeClient() {
    if (!client) {
        // Use environment variable for the Redis URL or fall back to default
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        
        client = createClient({
            url: redisUrl
        });
        
        client.on("error", (error) => {
            console.log(error);
        });
        
        client.on("connect", () => {
            console.log("Redis connected to:", redisUrl);
        });
        
        await client.connect();
    }
    return client;
}