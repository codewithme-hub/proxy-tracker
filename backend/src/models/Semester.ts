import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ISemester extends Document {
  _id: Types.ObjectId;
  group: Types.ObjectId;
  name: string;
  subjects: string[];
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const semesterSchema = new Schema<ISemester>(
  {
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    subjects: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

// Only one active semester per group at a time is enforced in the service layer,
// not here, since "switching active semester" needs to flip the old one off atomically.
semesterSchema.index({ group: 1, name: 1 }, { unique: true });

export const Semester = mongoose.model<ISemester>("Semester", semesterSchema);
