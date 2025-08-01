import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //subscriber karne vala uses
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, //jis user yaani jis channel ko subscribe kiya jaa rha hai
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = model("Subscription", subscriptionSchema);
