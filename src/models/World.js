import mongoose from "mongoose";

const WorldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  name: {
    type: String,
    required: [true, "World name is required"],
    trim: true,
  },
  mcVersion: {
    type: String,
    required: [true, "Minecraft version is required"],
  },
  seed: {
    type: String,
  },
  mode: {
    type: String,
    enum: ["survival", "hardcore", "creative"],
    required: [true, "Game mode is required"],
  },
  type: {
    type: String,
    enum: ["solo", "multiplayer"],
    required: [true, "World type is required"],
  },
  startedAt: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endedAt: {
    type: Date,
  },
  endReason: {
    type: String,
  },
  finalMessage: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareEnabled: {
    type: Boolean,
    default: false,
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const World = mongoose.models.World || mongoose.model("World", WorldSchema);

export default World;
