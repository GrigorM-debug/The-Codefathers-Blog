import { Schema, SchemaTypes, model } from "mongoose";
import { postValidationConstants } from "../validationConstants/post.js";
const postSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, postValidationConstants.title.requiredErrorMessage],
    minlength: [
      postValidationConstants.title.minLength,
      postValidationConstants.title.lengthErrorMessage,
    ],
    maxlength: [
      postValidationConstants.title.maxLength,
      postValidationConstants.title.lengthErrorMessage,
    ],
  },
  content: {
    type: String,
    trim: true,
    required: [true, postValidationConstants.content.requiredErrorMessage],
    minlength: [
      postValidationConstants.content.minLength,
      postValidationConstants.content.lengthErrorMessage,
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bannnerImageUrl: {
    type: String,
    trim: true,
    required: [
      true,
      postValidationConstants.bannerImageUrl.requiredErrorMessage,
    ],
    minlength: [
      postValidationConstants.bannerImageUrl.minLength,
      postValidationConstants.bannerImageUrl.lengthErrorMessage,
    ],
    maxlength: [
      postValidationConstants.bannerImageUrl.maxLength,
      postValidationConstants.bannerImageUrl.lengthErrorMessage,
    ],
  },
  author: {
    type: SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [{ type: SchemaTypes.ObjectId, ref: "Comment" }],
  commentCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  likes: [{ type: SchemaTypes.ObjectId, ref: "Like" }],
  likeCount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

postSchema.pre("save", function (next) {
  if (this.isModified("likes")) {
    this.likeCount = this.likes.length;
  }

  if (this.isModified("comments")) {
    this.commentCount = this.comments.length;
  }

  next();
});

const Post = model("Post", postSchema);

export default Post;
