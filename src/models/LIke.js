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

const Like = model("Like", likeSchema);

export default Like;
