import { Schema, model, SchemaTypes } from "mongoose";

const RoomSchema = new Schema({
  name: { type: String, required: true, unique: true },
  participants: [{ type: SchemaTypes.ObjectId, ref: "User", required: true }],
  createdAt: { type: Date, default: Date.now },
});

const Room = model("Room", RoomSchema);

export default Room;
