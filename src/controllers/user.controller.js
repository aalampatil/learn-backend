import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//access and refresh token generation
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

//register user
const registerUser = asyncHandler(async (req, res) => {
  //get details from frontend
  //validation check - "empty or not"
  //check if already exist or not
  //check for avatar and cover image
  //upload avatar and coverimage on cloudinary
  //handle file upload,
  //create user object to create entry in db
  //remove password and token from reponse
  //check for user creation
  //return response

  const { username, email, fullName, password } = req.body;
  //console.log("req.body", req.body);
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with this credentials already exist");
  }

  //console.log("req.files", req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    avatarPublicId: avatar.public_id,
    coverImage: coverImage.url || "",
    coverImagePublicId: coverImage.public_id || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "failed to register");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "user registered successfully"));
});

//login
const loginUser = asyncHandler(async (req, res) => {
  //get email, username, password from body
  //verify and validate (empty or not or valid credentials)
  //find if exist or not
  //password check
  //generate access and refresh token
  //send cookies
  //send response (exclude password and refresh token)

  const { email, username, password } = req.body;
  //console.log(email, password);

  if (!email && !username) {
    throw new ApiError(400, "email/username is missing");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "invalid credentials");
  }

  if (user) {
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(400, "invalid password");
    }
  }

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true, // samesite can be also be added
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully"
      )
    );
});

//logout
const logoutUser = asyncHandler(async (req, res) => {
  //create a authentication middleware.get token from cookies/header and verify it with the encypted token using secret,
  //use the decoded token to find user,as token payload is ._id
  //set user to req and call next();
  //clear refreshToken and cookies

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "logged out successfully"));
});

//refresh access token

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "unauthorized req");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "token expired or used before");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh Token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(400, "user does not exist");
  }

  if (!(await user.isPasswordCorrect(oldPassword))) {
    throw new ApiError(401, "invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user feteched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName, //fullName: fullName
        email: email, // email both syntax are valid
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  //console.log("avatar public id", req.user?.avatarPublicId);
  // Delete old avatar from Cloudinary using stored public_id
  await deleteFromCloudinary(req.user?.avatarPublicId);

  const newAvatar = await uploadOnCloudinary(avatarLocalPath);

  if (!newAvatar.url) {
    throw new ApiError(500, "error while uploading new avatar on cloudinary");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: newAvatar?.url,
        avatarPublicId: newAvatar?.public_id,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage is required");
  }

  //console.log("public id", req.user?.coverImagePublicId);

  await deleteFromCloudinary(req.user?.coverImagePublicId);

  const newCoverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!newCoverImage.url) {
    throw new ApiError(
      500,
      "error while uploading new coverImage on cloudinary"
    );
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: newCoverImage?.url,
        coverImagePublicId: newCoverImage?.public_id,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "avatar updated successfully"));
});

const getUserChannnelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "username missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "subscribers.subsriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  console.log(channel);

  if (!channel?.length) {
    throw new ApiError(404, "channel doesn't exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200,channel[0],
      "user channel fetched successfully")   
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
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
          {
            $addFields: {
              owner: {
                $first: "owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetch successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannnelProfile,
  getWatchHistory,
};
