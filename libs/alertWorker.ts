import { priceCache } from "./priceCache";
import Alert from "../models/Alert";
import { io } from "../server";

export function initAlertWorker() {
    console.log("AlertWorker started...");

    priceCache.onPrice(async (coinId, record) => {
        const alerts = await Alert.find({ coinId, triggered: false });

        for (const alert of alerts) {
            const latest = await priceCache.getPrice(coinId, alert.currency);
            if (!latest) continue;

            let triggered = false;

            if (alert.conditionType === "above" && latest.price >= alert.threshold)
                triggered = true;
            if (alert.conditionType === "below" && latest.price <= alert.threshold)
                triggered = true;

            if (alert.conditionType === "percent_up" || alert.conditionType === "percent_down") {
                const hist = await priceCache.redis.lrange(`price_history:${coinId}:${alert.currency}`, 0, 9);

                if (hist.length > 0) {
                    const last = JSON.parse(hist[hist.length - 1]);
                    const percent = ((latest.price - last.price) / last.price) * 100;

                    if (alert.conditionType === "percent_up" && percent >= alert.threshold)
                        triggered = true;
                    if (alert.conditionType === "percent_down" && percent <= -Math.abs(alert.threshold))
                        triggered = true;
                }
            }

            if (triggered) {
                alert.triggered = true;
                alert.triggeredAt = new Date();
                await alert.save();

                io.to(`${alert.userId}`).emit("alert:triggered", {
                    alertId: alert._id,
                    coinId,
                    condition: alert.conditionType,
                    threshold: alert.threshold,
                    price: latest.price,
                    triggered: alert.triggered,
                    triggeredAt: alert.triggeredAt,
                });

                console.log(`Alert ${alert._id} triggered for ${coinId}`);
            }
        }
    });
}
