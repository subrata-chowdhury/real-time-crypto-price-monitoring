import mongoose, { Schema, Document } from "mongoose";

export interface IAlert extends Document {
    userId: string;
    coinId: string;
    currency: string;
    conditionType: "above" | "below" | "percent_up" | "percent_down";
    threshold: number;
    triggered: boolean;
    createdAt: Date;
    triggeredAt?: Date;
}

const AlertSchema: Schema = new Schema({
    userId: { type: String, required: true },
    coinId: { type: String, required: true },
    currency: { type: String, default: "usd" },
    conditionType: { type: String, required: true },
    threshold: { type: Number, required: true },
    triggered: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    triggeredAt: { type: Date },
});

export default mongoose.model<IAlert>("Alert", AlertSchema);
