import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler";
import { Like } from "../models/like.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "Video is Required");
  }

  page = parseInt(page);
  limit = parseInt(page);

  const options = {
    page,
    limit,
  };

  const aggregateOptions = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
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
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likecount: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
        isLikedBy: {
          $cond: {
            if: { $in: [req.user?._id, "@likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
  ];

  const comments = await Comment.aggregatePaginate(aggregateOptions, options);

  if (!comments.length) {
    throw new ApiError(500, "Comments not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!content) {
    throw new ApiError(400, "missing field");
  }
  if (!userId) {
    throw new ApiError(401, "login to start commenting");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "invalid video id");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  if (!comment) {
    throw new ApiError(400, "unable to comment");
  }

  const createdComment = await Comment.findById(comment._id);

  if (!createdComment) {
    throw new ApiError(500, "Something want wrong while saving comment");
  }

  return res.status(200).json(new ApiResponse(200, comment, "comment added"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!content?.trim()) {
    throw new ApiError(400, "missing field");
  }
  if (!userId) {
    throw new ApiError(401, "login to start commenting");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment id");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized to update this comment");
  }

  comment.content = content;

  await comment.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment id");
  }

  if (!userId) {
    throw new ApiError(400, "login to delete comment");
  }

  const comment = await Comment.findById(commentId);

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized to delete this comment");
  }

  await Like.deleteMany({ comment: commentId });
  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json(new ApiResponse(200, {}, "comment deleted"));
});

export {getVideoComments, addComment, updateComment, deleteComment };
