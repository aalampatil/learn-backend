import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel id");
  }

  const subscriberId = req.user?._id;

  if (subscriberId.toString() === channelId.toString()) {
    throw new ApiError(400, "you can't subscribe your channel");
  }

  const existingSubscriber = await Subscription.findOne({
    subsriber: subscriberId,
    channel: channelId,
  });

  if (existingSubscriber) {
    await existingSubscriber.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "unsubscribed"));
  }

  const newSubscription = await Subscription.create({
    subsriber: subscriberId,
    channel: channelId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newSubscription, "subscribed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel id");
  }

  const allSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
        pipeline: [
          {
            $project: {
              avatar: 1,
              fullName: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscribers: { $first: "$subscribers" },
      },
    },
  ]);

  const count = await Subscription.countDocuments({
    channel: mongoose.Types.ObjectId(channelId),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { allSubscribers, count },
        "subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "invalid subscriber id");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedTo",
        pipeline: [
          {
            $project: {
              avatar: 1,
              fullName: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
        $addFields : {
            subscribedTo: {$first: "$subscribedTo"}
        }
    }
  ]);

  const count = await Subscription.countDocuments({
    subscriber: mongoose.Types.ObjectId(subscriberId),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribedChannels, count },
        "subscriberd channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
