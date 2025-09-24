import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import alertsRouter from "./routes/alerts";
import { priceCache } from "./libs/priceCache";
import { initPriceFetcher } from "./libs/priceFetcher";
import { initAlertWorker } from "./libs/alertWorker";

dotenv.config({ path: '.env.local' });
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/alerts", alertsRouter);

const server = http.createServer(app);
export const io = new IOServer(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("subscribe:coin", (coinId: string) => {
        socket.join(`coin:${coinId}`);
    });

    socket.on("unsubscribe:coin", (coinId: string) => {
        socket.leave(`coin:${coinId}`);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
    });
});

priceCache.onPrice((coinId, priceObj) => {
    io.to(`coin:${coinId}`).emit("price:update", { coinId, price: priceObj });
});

const PORT = process.env.PORT || 4000;

mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log("MongoDB connected");
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            initPriceFetcher();
            initAlertWorker();
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });
