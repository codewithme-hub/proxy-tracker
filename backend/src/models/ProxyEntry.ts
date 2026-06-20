import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IProxyEntry extends Document {
  _id: Types.ObjectId;
  group: Types.ObjectId;
  semester: Types.ObjectId;
  subject?: string;
  givenBy: Types.ObjectId; // the one who covered/marked the proxy (the "creditor")
  givenTo: Types.ObjectId; // the one who benefited (the "debtor")
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const proxyEntrySchema = new Schema<IProxyEntry>(
  {
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    semester: { type: Schema.Types.ObjectId, ref: "Semester", required: true, index: true },
    subject: { type: String, trim: true, maxlength: 60 },
    givenBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    givenTo: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

proxyEntrySchema.pre("validate", function (next) {
  if (this.givenBy.equals(this.givenTo)) {
    return next(new Error("givenBy and givenTo cannot be the same person"));
  }
  next();
});

proxyEntrySchema.index({ group: 1, semester: 1, date: -1 });

export const ProxyEntry = mongoose.model<IProxyEntry>("ProxyEntry", proxyEntrySchema);
