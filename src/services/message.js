import Message from "../models/Message.js";

export async function createMessage(roomId, senderId, text) {
  const message = new Message({ room: roomId, sender: senderId, text: text });
  return await message.save();
}

export async function getMessagesByRoomId(roomId) {
  const message = await Message.find({ room: roomId })
    .populate("sender")
    .lean();
  return message;
}
