import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import {
  updateCommentsCollectionInPostSchemaWhenCommentingPost,
  updateCommentsCollectionInPostSchemaWhenDeletingComment,
} from "./post.js";

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

export async function isUserCommentAuthor(userId, postId) {
  const comment = await Comment.findOne({ author: userId, post: postId });

  if (!comment) {
    return false;
  }

  return true;
}

export async function deleteComment(userId, postId) {
  const comment = await Comment.findOne({ author: userId, post: postId });

  if (comment) {
    await comment.deleteOne(comment);
    await updateCommentsCollectionInPostSchemaWhenDeletingComment(
      comment._id,
      postId
    );
  }
}

export async function getComment(userId, postId) {
  const comment = await Comment.findOne({ author: userId, post: postId });

  return comment;
}

export async function updateComment(userId, postId, updatedContent) {
  await Comment.findOneAndUpdate(
    { author: userId, post: postId },
    { content: updatedContent, createdAt: new Date() }
  );
}
