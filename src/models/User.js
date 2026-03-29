import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationCodeHash: {
    type: String,
    default: "",
  },
  emailVerificationExpiresAt: {
    type: Date,
    default: null,
  },
  emailVerificationLastSentAt: {
    type: Date,
    default: null,
  },
  emailVerificationAttempts: {
    type: Number,
    default: 0,
  },
  displayName: { type: String, default: "" },
  realName: { type: String, default: "" },
  age: { type: Number },
  country: { type: String, default: "" },
  experienceLevel: { type: String, default: "" },
  favoriteGameModes: { type: [String], default: [] },
  favoriteActivities: { type: [String], default: [] },
  bio: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  joinedAt: { type: Date, default: Date.now },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
