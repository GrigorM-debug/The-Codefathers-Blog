import { Schema, SchemaTypes, model } from "mongoose";
import { postValidationConstants } from "../validationConstants/post.js";
const postSchema = new Schema({
  title: {
    type: String,
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
    required: [true, postValidationConstants.bannerImageUrl.requiredErrorMessage],
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
  likes: [{ type: SchemaTypes.ObjectId, ref: "Like" }],
});

const Post = model("Post", postSchema);

export default Post;
