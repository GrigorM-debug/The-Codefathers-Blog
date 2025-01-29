import { Schema, SchemaTypes, model } from "mongoose";

const likeSchema = new Schema({
  author: { 
    type: SchemaTypes.ObjectId, 
    ref: "User", required: true 
  },
  post: { 
    type: SchemaTypes.ObjectId, 
    ref: "Post", required: true 
  },
});

//Ensures that a user can only like a post once
likeSchema.index({ author: 1, post: 1 }, { unique: true });

const Like = model("Like", likeSchema);

export default Like;
