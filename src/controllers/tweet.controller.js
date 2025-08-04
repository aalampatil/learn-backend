import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.params;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const tweet = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "likedBy",
        as: "LikeCount",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likeCount",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $unwind: "$owner",
    },
  ]);

  if (!tweet.length) {
    throw new ApiError(400, "no tweet found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content.trim()) {
    throw new ApiError(400, "missing field");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "login to start tweet");
  }

  const tweet = await Tweet.create({
    owner: userId,
    content,
  });

  if (!tweet) {
    throw new ApiError(400, "failed to create comment");
  }

  const createdTweet = await Tweet.findById(tweet._id);

  if (!createdTweet) {
    throw new ApiError(400, "failed to save tweet");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "tweet created"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet Id");
  }

  if (!content.trim()) {
    throw new ApiError(400, "missing field");
  }
  if (userId) {
    throw new ApiError(400, "login to update tweet");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "failed to retieve tweet");
  }

  if (tweet.owner.toString() !== userId) {
    throw new ApiError(400, "unauthorised to update tweet");
  }

  tweet.content = content;
  await tweet.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.uer?._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet id");
  }

  if (!userId) {
    throw new ApiError(400, "login to delete tweet");
  }

  const tweet = await Tweet.findById(tweetId);

  if (tweet.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized to delete this tweet");
  }

  await Like.deleteMany({ tweet: tweetId });
  await tweet.findByIdAndDelete(tweetId);

  return res.status(200).json(new ApiResponse(200, {}, "tweet deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
