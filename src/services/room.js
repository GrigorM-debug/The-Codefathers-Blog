import Room from "../models/Room.js";

export async function createRoom(roomName) {
  const room = new Room({ name: roomName });
  await room.save();
}

export async function getAllRooms() {
  return await Room.find().lean();
}

export async function addUserToRoom(roomId, userId) {
  const room = await Room.findById(roomId);
  if (room) {
    room.participants.push(userId);
    await room.save();
  }
}

export async function checkIfUserAlreadyInRoom(roomId, userId) {
  const room = await Room.findById(roomId);
  if (room) {
    const IsUserInRoom = await room.participants.includes(userId);

    if (IsUserInRoom) {
      return true;
    } else {
      return false;
    }
  }
}

export async function roomExistById(roomId) {
  const room = await Room.findById(roomId);

  if (!room) {
    return false;
  }

  return true;
}

export async function getRoomNameByRoomId(roomId) {
  const room = await Room.findById(roomId);

  if (room) {
    return room.name;
  }
}

export async function roomExistByName(name) {
  const room = await Room.findOne({ name: name });

  if (!room) {
    return false;
  }

  return true;
}
