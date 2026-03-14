import {redisClient} from "./redis.db.js"


export const revoked_key=({userId, jti})=>{
    return `revoke_token::${userId}::${jti}`
}

export const get_key=({userId})=>{
    return `revoke_token::${userId}`
}

export const setValue = async ({key, value, ttl}={}) => {
    try {
       const data = typeof value === "string" ? value : JSON.stringify(value);
       return ttl? await redisClient.set(key, data, {EX: ttl}) : await redisClient.set(key, data);
    } catch (error) {
        console.error("Error setting value in Redis:", error);
    }
};

export const update = async ({key, value,ttl}={}) => {
    try {
        if (!await redisClient.exists(key)) {
           return 0
        }
       
        return await setValue({key, value,ttl});

    } catch (error) {
        console.error("Error updating value in Redis:", error);
    }
}

export const get = async (key) => {
    try {
        try {
            return JSON.parse(await redisClient.get(key));
        } catch (error) {
            return await redisClient.get(key);
        }
    } catch (error) {
        console.error("Error getting value from Redis:", error);
    }
}

export const del = async (key) => {
    try {
        if(!key.length) return 0
        return await redisClient.del(key);
    } catch (error) {
        console.error("Error deleting value from Redis:", error);
    }
}

export const ttl = async (key) => {
    try {
          return await redisClient.ttl(key);
    } catch (error) {
        console.error("Error getting TTL of key in Redis:", error);
    }
}

export const exists = async (key) => {
    try {
        return await redisClient.exists(key);
    } catch (error) {
        console.error("Error checking existence of key in Redis:", error);
    }
}

export const expire = async ({key, ttl}) => {
    try {
        return await redisClient.expire(key, ttl);
    } catch (error) {
        console.error("Error setting expiration for key in Redis:", error);
    }
}

export const keys = async (pattern) => {
    try {
        return await redisClient.keys(`${pattern}*`);
    } catch (error) {
        console.error("Error getting keys from Redis:", error);
    }
}

