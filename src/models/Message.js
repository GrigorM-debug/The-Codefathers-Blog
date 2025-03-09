import { Schema, model, SchemaTypes } from "mongoose";

const MessageSchema = new Schema({
  roomId: { type: SchemaTypes.ObjectId, ref: "Room", required: true },
  senderId: { type: SchemaTypes.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = model("Message", MessageSchema);

export default Message;
