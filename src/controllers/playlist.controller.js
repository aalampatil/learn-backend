import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if ([name, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "empty fields");
  }

  const owner = req.user?._id;

  if (!owner) {
    throw new ApiError(401, "login required");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner,
  });

  if (!playlist) {
    throw new ApiError(400, "failed to create playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist created successfully"));
});

////////////////////////////

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "invalid user id");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos", // internatiional
        localField: "videos", //domestic
        foreignField: "_id", // from inernational
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  if (!playlists.length) {
    throw new ApiError(400, "playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "all playlists fetched successfully")
    );
});

/////////////////////

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
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
        ],
      },
    },
  ]);

  if (!playlist.length) {
    throw new ApiError(400, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

//////////////////////////

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "playlist not found ");
  }

  const user = req.user?._id;

  if (!user) {
    throw new ApiError(401, "user not logged in");
  }

  if (playlist.owner.toString() !== user._id.toString()) {
    throw new ApiError(400, "unauthorised user");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "video already in playlist");
  }

  playlist.videos.push(videoId);

  await playlist.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video added to the playlist"));
});

///////////////////

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "playlist not found ");
  }

  const user = req.user?._id;

  if (!user) {
    throw new ApiError(401, "user not logged in");
  }

  if (playlist.owner.toString() !== user._id.toString()) {
    throw new ApiError(400, "unauthorised user");
  }

  playlist.videos = playlist.videos.filter(
    (video) => video.toString() !== videoId
  );

  await playlist.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video removed from the playlist"));
});

////////////////////

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "playlist not found ");
  }

  const user = req.user?._id;

  if (!user) {
    throw new ApiError(401, "user not logged in");
  }

  if (playlist.owner.toString() !== user._id.toString()) {
    throw new ApiError(400, "unauthorised user");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res.status(200).json(new ApiResponse(200, {}, "playlist deleted"));
});

/////////////////////

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "playlist not found");
  }

  const user = req.user?._id;

  if (!user) {
    throw new ApiError(401, "user not logged in");
  }

  if (playlist.owner.toString() !== user._id.toString()) {
    throw new ApiError(400, "unauthorised user");
  }

  if (name) playlist.name = name;
  if (description) playlist.description = description;

  await playlist.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
