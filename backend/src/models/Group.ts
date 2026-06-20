import mongoose, { Schema, type Document, type Types } from "mongoose";

export type GroupRole = "admin" | "member";

export interface IGroupMember {
  user: Types.ObjectId;
  role: GroupRole;
  joinedAt: Date;
}

export interface IGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  inviteCode: string;
  members: IGroupMember[];
  maxMembers: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const groupMemberSchema = new Schema<IGroupMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    inviteCode: { type: String, required: true, unique: true, index: true },
    members: {
      type: [groupMemberSchema],
      validate: {
        validator: (members: IGroupMember[]) => members.length <= 4,
        message: "A group can have at most 4 members",
      },
    },
    maxMembers: { type: Number, default: 4, min: 2, max: 4 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroup>("Group", groupSchema);
