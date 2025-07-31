import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

/*const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  if (!req.user) {
    throw new ApiError(401, "User needs to be logged in");
  }

  const match = {
    ...(query ? { title: { $regex: query, $option: "i" } } : {}),
    ...(userId ? { owner: mongoose.Types.ObjectId(userId) } : {}),
  };

  const videos = await Video.aggregate([
    {
      $match: match,
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "videosByOwner",
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        owner: {
          $arrayElemAt: ["$videosByOwner", 0],
        },
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "desc" ? -1 : 1,
      },
    },
    {
      $skip: (page - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  if (!videos?.length) {
    throw new ApiError(404, "videos not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"));
});
*/

//publish video
const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  //console.log(req.files);

  //   const videoLocalPath = req.files?.videoFile[0]?.path;
  //   const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  let videoLocalPath;
  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    req.files.videoFile.length > 0
  ) {
    videoLocalPath = req.files.videoFile[0].path;
  }
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoLocalPath) {
    throw new ApiError(400, " video is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, " thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  //console.log(videoFile);

  const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile)
    throw new ApiError(500, "error while uploading video to cloudinary");
  if (!thumbnailFile)
    throw new ApiError(500, "error while uploading thumbnail to cloudinary");

  const video = await Video.create({
    title,
    description,
    owner: req.user?._id,
    thumbnail: thumbnailFile.url,
    thumbnailPublicId: thumbnailFile.public_id,
    videoFile: videoFile.url,
    videoFilePublicId: videoFile.public_id,
    duration: videoFile.duration,
    views: 0,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video published successfully"));
});

//get video by id
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "invalid video id");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID format");
  }

  const video = await Video.findById(videoId).populate("owner", "name email");

  if (!video) {
    throw new ApiError(400, "this video doesn't exist");
  }

  return res.status(200).json(new ApiResponse(200, video, "video found"));
});

//update video details like- title, description, thumbnail,
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  const video = await Video.findById(videoId);

  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "missing fields");
  }

  const oldThumbnailPublicId = video.thumbnailPublicId;
  console.log(oldThumbnailPublicId);

  const thumbnailLocalPath = req.file?.path;
  const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: newThumbnail.url,
        thumbnailPublicId: newThumbnail.public_id,
      },
    },
    { new: true }
  );

  await deleteFromCloudinary(oldThumbnailPublicId);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "updated successfully"));
});

//delete Video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video not found");
  }

  await deleteFromCloudinary(video.thumbnailPublicId);
  await deleteFromCloudinary(video.videoFilePublicId);
  const deleteResponse = await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, deleteResponse, "video deleted successfully"));
});

//toggle publish status

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: true,
      },
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(400, "video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video status updated"));
});

export {
  //getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
};
