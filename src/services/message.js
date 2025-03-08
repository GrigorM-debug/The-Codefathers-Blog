import Message from "../models/Message.js";

export async function createMessage(roomId, senderId, username, text) {
  const message = new Message({ roomId, senderId, username, text });
  return await message.save();
}

export async function getMessagesByRoomId(roomId) {
  const message = await Message.find({ roomId });
  return message;
}
