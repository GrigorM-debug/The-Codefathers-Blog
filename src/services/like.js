import Like from "../models/LIke.js";
import mongoose from "mongoose";
import { updateLikesCollectionInPostSchema } from "./post.js";

export async function likeExistsByUserIdAndPostId(userId, postId) {
  const like = await Like.findOne({ author: userId, post: postId });

  if (!like) {
    return false;
  }

  return true;
}

export async function likePost(userId, postId) {
  const like = new Like({
    _id: new mongoose.Types.ObjectId(),
    author: userId,
    post: postId,
  });

  await like.save();

  await updateLikesCollectionInPostSchema(postId, like._id);
}
