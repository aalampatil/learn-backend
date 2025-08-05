import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "login to fetch stats");
  }

  const channelStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: { $size: "$likes" },
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
        totalVideos: {
          $sum: 1,
        },
        totalLikes: {
          $sum: "$likes",
        },
      },
    },
    {
      $addFields: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "totalSubscribers",
      },
    },
    {
      $addFields: {
        totalSubscribers: {
          $size: "$totalSubscribers",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Channel Stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  if (!userId) {
    throw new ApiError(401, "login to proceed");
  }

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  if (!videos) {
    throw new ApiError(400, "error fething channel videos");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
