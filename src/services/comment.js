import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import { updateCommentsCollectionInPostSchemaWhenCommentingPost } from "./post.js";

export async function createComment(commentData) {
  const newComment = await new Comment({
    _id: new mongoose.Types.ObjectId(),
    content: commentData.content,
    author: commentData.author,
    post: commentData.post,
    createdAt: new Date(),
  });

  await newComment.save();
  await updateCommentsCollectionInPostSchemaWhenCommentingPost(
    newComment._id,
    commentData.post
  );
}

export async function commentExist(userId, postId) {
  const comment = await Comment.findOne({ author: userId, post: postId });

  if (!comment) {
    return false;
  }

  return true;
}
