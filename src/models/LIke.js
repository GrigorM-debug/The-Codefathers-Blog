import { Schema, SchemaTypes, model } from "mongoose";

const likeSchema = new Schema({
  _id: SchemaTypes.ObjectId,
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

likeSchema.index({ author: 1, post: 1 }, { unique: true });

const Like = model("Like", likeSchema);

export default Like;
