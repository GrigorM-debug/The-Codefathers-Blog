import { Schema, model } from "mongoose";

const MessageSchema = new Schema({
  roomId: { type: String, required: true },
  senderId: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = model("Message", MessageSchema);

export default Message;
