import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema({
  worldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "World",
    required: [true, "World ID is required"],
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  category: {
    type: String,
    enum: ["achievement", "build", "death", "funny", "emotional"],
    required: [true, "Category is required"],
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  memoryDate: {
    type: Date,
    required: [true, "Memory date is required"],
  },
  source: {
    type: String,
    enum: ["manual", "auto_screenshot", "auto_advancement"],
    default: "manual",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    expires: 864000, // 10 days in seconds
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MemorySchema.index({ worldId: 1, isDeleted: 1, memoryDate: -1, createdAt: -1 });

const Memory =
  mongoose.models.Memory || mongoose.model("Memory", MemorySchema);

export default Memory;
