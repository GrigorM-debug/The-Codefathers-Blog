import { Router } from "express";
import { isAuthenticated } from "../middlewares/guards.js";
import { updateUserSocketId } from "../services/user.js";
import {
  addUserToRoom,
  getRoomNameByRoomId,
  roomExistById,
} from "../services/room.js";
import { createMessage, getMessagesByRoomId } from "../services/message.js";
import { getAllRooms, createRoom } from "../services/room.js";

const roomRouter = Router();

//Get rooms
roomRouter.get("/rooms", isAuthenticated(), async (req, res, next) => {
  const username = req?.user?.username;
  try {
    const errors = req.session.errors || [];
    delete req.session.errors;

    const rooms = await getAllRooms();
    res.render("chat/room_select", { rooms, username, errors });
  } catch (err) {
    next(err);
  }
});

//Join room. Currently not using it. Maybe remove it.
roomRouter.post("/join", isAuthenticated(), async (req, res, next) => {
  const { name, socketId, roomId } = req.body;
  const userId = req?.user?._id;
  const username = req?.user?.username;

  if (!name || !socketId || !roomId) {
    req.session.errors = [{ msg: "Name, socketId, and roomId are required" }];
    return res.redirect(`/rooms`);
  }

  try {
    const isRoomExisting = await roomExistById(roomId);

    if (!isRoomExisting) {
      return res.render("error_pages/404", {
        errors: [{ msg: "Room doesn't exist" }],
      });
    }

    await updateUserSocketId(username, socketId);
    await addUserToRoom(roomId, userId);

    req.session.successMessage = {
      success: true,
      msg: "Successfully joined",
    };

    res.redirect(`/messages/${roomId}`);
  } catch (err) {
    console.error("Error in joinChat:", err);
    next(err);
  }
});

//Get room messages
roomRouter.get(
  "/messages/:roomId",
  isAuthenticated(),
  async (req, res, next) => {
    const { roomId } = req.params;

    try {
      const isRoomExisting = await roomExistById(roomId);

      if (!isRoomExisting) {
        return res.render("error_pages/404", {
          errors: [{ msg: "Room doesn't exist" }],
        });
      }

      const roomName = await getRoomNameByRoomId(roomId);

      const successMessage = req.session.successMessage || {};
      delete req.session.successMessage;

      const messages = await getMessagesByRoomId(roomId);

      console.log(messages);

      res.render("chat/room_messages", {
        successMessage,
        messages,
        roomName,
        roomId,
      });
    } catch (err) {
      next(err);
    }
  }
);

//Create message
roomRouter.post("/message", isAuthenticated(), async (req, res, next) => {
  const { senderId, roomId, username, text } = req.body;
  if (!senderId || !roomId || !username || !text) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const message = await createMessage(roomId, senderId, username, text);
    res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    next(err);
  }
});

//Create room get. Shows the create room form
roomRouter.get("/create_room", isAuthenticated(), async (req, res, next) => {});

//Create room post
roomRouter.post("/create_room", isAuthenticated(), async (req, res, next) => {
  const { roomName } = req.body;
  if (!roomName) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const room = await createRoom(roomName);
    res.status(201).json({ message: "Room created", data: room });
  } catch (err) {
    next(err);
  }
});

export default roomRouter;
