import IORedis from "ioredis";
import EventEmitter from "events";
import dotenv from "dotenv";
dotenv.config({ path: '.env.local' });

const redis = new IORedis(process.env.REDIS_URL);
const emitter = new EventEmitter();

type PriceRecord = {
    price: number;
    lastUpdated: number;
};

export const priceCache = {
    async setPrice(coinId: string, currency: string, price: number) {
        const key = `price:${coinId}:${currency}`;
        const val = JSON.stringify({ price, lastUpdated: Date.now() });
        await redis.set(key, val, "EX", 30);
        // also push to a stream/list for last N points if needed
        await redis.lpush(`price_history:${coinId}:${currency}`, val);
        await redis.ltrim(`price_history:${coinId}:${currency}`, 0, 99); // keeping last 100
        emitter.emit("price", coinId, { price, lastUpdated: Date.now() });
    },
    async getPrice(coinId: string, currency: string): Promise<PriceRecord | null> {
        const key = `price:${coinId}:${currency}`;
        const v = await redis.get(key);
        return v ? JSON.parse(v) : null;
    },
    onPrice(cb: (coinId: string, data: PriceRecord) => void) {
        emitter.on("price", cb);
    },
    redis,
};
