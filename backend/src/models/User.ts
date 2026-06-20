import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatarUrl?: string;
  activeGroup?: Types.ObjectId;
  refreshTokens: { token: string; createdAt: Date; expiresAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    googleId: { type: String, index: true, sparse: true },
    avatarUrl: { type: String },
    activeGroup: { type: Schema.Types.ObjectId, ref: "Group", default: null },
    refreshTokens: {
      type: [
        {
          token: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          expiresAt: { type: Date, required: true },
        },
      ],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
