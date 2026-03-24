import mongoose from "mongoose";

const CoordinateSchema = new mongoose.Schema({
  worldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "World",
    required: [true, "World ID is required"],
  },
  label: {
    type: String,
    required: [true, "Label is required"],
    trim: true,
  },
  x: {
    type: Number,
    required: [true, "X coordinate is required"],
  },
  y: {
    type: Number,
    required: [true, "Y coordinate is required"],
  },
  z: {
    type: Number,
    required: [true, "Z coordinate is required"],
  },
  category: {
    type: String,
    enum: ["base", "structure", "resource", "portal", "poi", "other"],
    required: [true, "Category is required"],
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Coordinate =
  mongoose.models.Coordinate || mongoose.model("Coordinate", CoordinateSchema);

export default Coordinate;
