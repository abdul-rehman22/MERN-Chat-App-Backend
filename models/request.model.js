import { Schema, Types, model } from "mongoose";

const requestSchema = new Schema(
  {
    content: String,
    status: {
      type: "string",
      default: "pending",
      enum: ["pending", "accepted", "rejected"],
    },
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Request = model("Request", requestSchema);
