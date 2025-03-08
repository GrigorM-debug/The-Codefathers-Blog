import { Schema, model } from "mongoose";

const RoomSchema = new Schema({
  name: { type: String, required: true, unique: true },
  participants: [{ type: String, required: true }],
});

const Room = model("Room", RoomSchema);

export default Room;
