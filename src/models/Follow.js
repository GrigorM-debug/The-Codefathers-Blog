import { model, Schema } from "mongoose";

const FollowSchema = new Schema({
  follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
  following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Index to enforce uniqueness of follower-following pairs
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = model("Follow", FollowSchema);

export default Follow;
