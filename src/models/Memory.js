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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Memory =
  mongoose.models.Memory || mongoose.model("Memory", MemorySchema);

export default Memory;
