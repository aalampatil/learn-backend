import { Schema, model } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    videos: [{
      type: Schema.Types.ObjectId,
      ref: "Video",
    }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  },
  { timestamps: true }
);

export const Playlist = model("Playlist", playlistSchema);
