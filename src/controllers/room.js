import { Router } from "express";
import { isAuthenticated } from "../middlewares/guards.js";
import { updateUserSocketId } from "../services/user.js";
import {
  addUserToRoom,
  getRoomNameByRoomId,
  roomExistById,
  roomExistByName,
} from "../services/room.js";
import { createMessage, getMessagesByRoomId } from "../services/message.js";
import {
  getAllRooms,
  createRoom,
  checkIfUserAlreadyInRoom,
} from "../services/room.js";
import { roomValidations } from "../express-validator/room.js";

import { csrfSync } from "csrf-sync";
import { validationResult } from "express-validator";

const { generateToken } = csrfSync();

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    console.log(req.body._csrf);
    return req.body["_csrf"];
  }, // Used to retrieve the token submitted by the user in a form
});

const roomRouter = Router();

//Get rooms
roomRouter.get("/rooms", isAuthenticated(), async (req, res, next) => {
  const username = req?.user?.username;
  try {
    const errors = req.session.errors || [];
    delete req.session.errors;

    const success = req.session.successMessage || null;
    delete req.session.successMessage;

    const rooms = await getAllRooms();
    res.render("chat/room_select", { rooms, username, errors, success });
  } catch (err) {
    next(err);
  }
});

//Join room. Currently not using it. Maybe remove it.
roomRouter.post("/join/:roomId", isAuthenticated(), async (req, res, next) => {
  const { roomId } = req.params;
  const userId = req?.user?._id;
  const username = req?.user?.username;

  if (!username || !roomId) {
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

    const isUserInRoom = await checkIfUserAlreadyInRoom(roomId, userId);

    // await updateUserSocketId(username, socketId);

    if (isUserInRoom) {
      return res.redirect(`/messages/${roomId}`);
    }

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
    const user = req.user;

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
        user: {
          _id: user._id,
          username: user.username,
          imageUrl: user.imageUrl,
        },
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
    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
});

//Create room get. Shows the create room form
roomRouter.get("/create_room", isAuthenticated(), async (req, res) => {
  //generate csrf token
  const csrfToken = generateToken(req, true);
  //render the view
  res.render("chat/create_room", { csrfToken: csrfToken });
});

//Create room post
roomRouter.post(
  "/create_room",
  isAuthenticated(),
  csrfSynchronisedProtection,
  roomValidations,
  async (req, res, next) => {
    console.log(req.body.name);
    //validate the body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("chat/create_room", {
        data: req.body,
        errors: errors.array(),
      });
    }

    try {
      //check if room already exists by name
      const isRoomExisting = await roomExistByName(req.body.name);

      if (isRoomExisting) {
        return res.render("chat/create_room", {
          data: req.body,
          errors: [{ msg: "Room already exists" }],
        });
      }

      //create the room
      await createRoom(req.body.name);

      req.session.successMessage = {
        success: true,
        msg: "Room successfully created",
      };

      res.redirect("/rooms");
    } catch (err) {
      next(err);
    }
  }
);

export default roomRouter;
