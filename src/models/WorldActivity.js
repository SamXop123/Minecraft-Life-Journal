import mongoose from "mongoose";

const WorldActivitySchema = new mongoose.Schema({
  worldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "World",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  played: {
    type: Boolean,
    default: true,
  },
  memoryCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

WorldActivitySchema.index({ worldId: 1, date: 1 }, { unique: true });

const WorldActivity =
  mongoose.models.WorldActivity ||
  mongoose.model("WorldActivity", WorldActivitySchema);

export default WorldActivity;
