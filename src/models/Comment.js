import { Schema, SchemaTypes, model } from "mongoose";
import { commentValidationConstants } from "../validationConstants/comment.js";

const commentSchema = new Schema({
  _id: SchemaTypes.ObjectId,
  content: {
    type: String,
    required: [true, commentValidationConstants.content.requiredErrorMessage],
    minlength: [
      commentValidationConstants.content.minLength,
      commentValidationConstants.content.lengthErrorMessage,
    ],
    maxlength: [
      commentValidationConstants.content.maxLength,
      commentValidationConstants.content.lengthErrorMessage,
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: SchemaTypes.ObjectId,
    ref: "Post",
    required: true,
  },
});

commentSchema.index({ author: 1, post: 1 }, { unique: true });

const Comment = model("Comment", commentSchema);

export default Comment;
