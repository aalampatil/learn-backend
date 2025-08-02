import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (existingLike) {
    await Like.findOneAndRemove({ video: videoId, likedBy: userId });
    return res.status(200).json(new ApiResponse(200, {}, "Video unliked"));
  }

  const newLike = await Like.create({
    video: videoId,
    likedBy: userId,
  });
  return res.status(200).json(new ApiResponse(200, newLike, "Video liked"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await Like.findOneAndRemove({ comment: commentId, likedBy: userId });
    return res.status(200).json(new ApiResponse(200, {}, "Video unliked"));
  }

  const newLike = await Like.create({
    comment: commentId,
    likedBy: userId,
  });
  return res.status(200).json(new ApiResponse(200, newLike, "Video liked"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(404, "invalid tweet Id");
  }

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "user is not logged in");
  }

  const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (existingLike) {
    await Like.findOneAndRemove({ tweet: tweetId, likedBy: userId });
    return res.status(200).json(new ApiError(200, {}, "like removed"));
  }

  const newLike = await Like.create({
    tweet: tweetId,
    likedBy: userId,
  });

  return res.status(200).json(new ApiError(200, newLike, "tweet liked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "User is not logged in");
  }

  const likedVideos = await Like.aggregate([
    {
      $match: {
        video: { $exists: true },
        likedBy: userId,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $addFields: {
        video: { $first: "$video" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "video.owner",
      },
    },
    {
      $addFields: {
        "video.owner": { $first: "$video.owner" },
      },
    },
    {
      $project: {
        video: {
          _id: 1,
          title: 1,
          description: 1,
          url: 1,
          thumbnail: 1,
          owner: {
            _id: 1,
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      },
    },
  ]);

  if (!likedVideos.length) {
    throw new ApiError(404, "No liked videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});


// const getLikedVideos = asyncHandler(async (req, res) => {
 

//   const userId = req.user?._id;
//   if (!userId) {
//     throw new ApiError(400, "user is not logged in");
//   }

//   const likedVideos = await Like.aggregate([
//     {
//       $match: {
//         video: {
//           $exists: true,
//         },
//         likedBy: userId,
//       },
//     },
//     {
//       $lookup: {
//         from: "videos",
//         localField: "video",
//         foreignField: "_id",
//         as: "video",
//         pipeline: [
//           {
//             from: "users",
//             localField: "owner",
//             foreignField: "_id",
//             as: "owner",
//             pipeline: [
//               {
//                 $project: {
//                   username: 1,
//                   fullname: 1,
//                   avatar: 1,
//                 },
//               },
//             ],
//           },
//         ],
//       },
//     },
//     {
//       $addFields: {
//         $first: "$video"
//       },
//     },
//   ]);

//   if (!likedVideos.length) {
//     throw new ApiError(404, "No Liked videos");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, likedVideos, "Liked Videos fetched successfully"));
// });

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
