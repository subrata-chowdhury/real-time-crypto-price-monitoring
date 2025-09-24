import { priceCache } from "./priceCache";

const COINGECKO = process.env.COINGECKO_BASE || "https://api.coingecko.com/api/v3";
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || 5000);
const COINS = ["bitcoin", "ethereum", "dogecoin"];
const CURRENCY = "usd";

export function initPriceFetcher() {
    console.log("Starting PriceFetcher...");
    const fetchPrices = async () => {
        try {
            const ids = COINS.join(",");
            const url = `${COINGECKO}/simple/price?ids=${ids}&vs_currencies=${CURRENCY}`;
            const resp = await fetch(url);
            const data: Record<string, Record<string, number>> = await resp.json();
            for (const coinId of Object.keys(data)) {
                const price = data[coinId][CURRENCY];
                await priceCache.setPrice(coinId, CURRENCY, price);
            }
        } catch (err) {
            console.error("PriceFetcher error", err);
        } finally {
            setTimeout(fetchPrices, POLL_INTERVAL);
        }
    };
    fetchPrices();
}
