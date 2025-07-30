import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  //console.log(req.files);

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, " video is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, " thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  console.log(videoFile);
  
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
    views:0,
    isPublished: true
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video uploaded successfully"));
});

export { publishVideo };
