import Message from "../models/Message.js";

export async function createMessage(roomId, senderId, text) {
  const message = new Message({
    room: roomId,
    sender: senderId,
    text: text,
  });

  await message.save();

  const populatedMessage = await Message.findById(message._id)
    .populate("sender")
    .lean();

  populatedMessage.createdAt = populatedMessage.createdAt.toLocaleString();
  return populatedMessage;
}

export async function getMessagesByRoomId(roomId) {
  const messages = await Message.find({ room: roomId })
    .populate("sender")
    .lean();

  messages.forEach((m) => {
    m.createdAt = m.createdAt.toLocaleString();
  });

  return messages;
}
