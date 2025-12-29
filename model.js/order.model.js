import mongoose, { Schema } from "mongoose";
const orderSchema = new Schema(
  {
    grandTotal: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    paidTotal: {
      type: Number,
      default: 0,
    },
    status: {
      type: "String",
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    paymentIntendId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
