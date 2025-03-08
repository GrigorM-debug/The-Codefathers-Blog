import Room from "../models/Room.js";

export async function createRoom(roomName) {
  const room = new Room({ name: roomName });
  await room.save();
  return room;
}

export async function getAllRooms() {
  return await Room.find();
}

export async function addUserToRoom(roomId, userId) {
  const room = await Room.findById(roomId);
  if (room) {
    room.participants.push(userId);
    await room.save();
  }
}
