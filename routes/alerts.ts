import express from "express";
import Alert from "../models/Alert";

const router = express.Router();

// Create alert
router.post("/", async (req, res) => {
    try {
        const { userId, coinId, conditionType, threshold, currency } = req.body;

        if (!userId || !coinId || !conditionType || threshold == null) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const alert = await Alert.create({
            userId,
            coinId,
            conditionType,
            threshold,
            currency: currency || "usd",
        });

        res.json(alert);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// List alerts for user
router.get("/user/:userId", async (req, res) => {
    try {
        const alerts = await Alert.find({ userId: req.params.userId });
        res.json(alerts);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
