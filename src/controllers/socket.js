import {
  getUserBySocketId,
  updateUserSocketId,
  userExixtsById,
} from "../services/user.js";
import { createMessage, getMessagesByRoomId } from "../services/message.js";
import { checkIfUserAlreadyInRoom } from "../services/room.js";

export async function handleSocketConnection(io) {
  io.on("connection", (socket) => {
    //This is listening for join event trigger for joining rooms
    socket.on("join", async ({ userId, roomId }) => {
      const socketId = socket.id;

      try {
        //leave previous room
        const alreadyInRoom = await checkIfUserAlreadyInRoom(roomId, userId);
        if (alreadyInRoom) {
          socket.leave(roomId);
          console.log(`User ${userId} left room: ${roomId}`);
        }

        const isUserExisting = await userExixtsById(userId);

        if (isUserExisting) {
          await updateUserSocketId(userId, socketId);
          socket.join(roomId);

          const user = await getUserBySocketId(socketId);

          //Emit event back to the all room members
          io.to(roomId).broadcast.emit(
            "roomJoined",
            `${user.username} has joined the chat!`
          );

          //Upon connection - only to user
          socket.emit("roomJoined", "Welcome to the chat!");
        }
      } catch (err) {
        console.error("Error joining room: ", err);
      }
    });

    //Listening for message event
    socket.on("message", async ({ roomId, text }) => {
      try {
        const user = await getUserBySocketId(socket.id);

        if (!user) {
          return;
        }

        const message = await createMessage(roomId, user._id, text);

        console.log("Message created: ", message);

        // Emit the message to all clients in the room
        io.to(roomId).broadcast.emit("message", {
          message: {
            ...message,
            sender: {
              _id: user._id,
              username: user.username,
              imageUrl: user.imageUrl,
            },
          },
        });
      } catch (err) {
        console.error("Error handling message: ", err);
      }
    });

    //When user disconnects - to all other users
    socket.on("leave", ({ roomId, username }) => {
      socket.leave(roomId);
      io.to(roomId).broadcast.emit("message", {
        text: `${username} has left the chat!`,
        system: true,
      });
    });

    //Listening for activity event
    socket.on("activity", ({ roomId, username }) => {
      io.to(roomId).broadcast.emit("activity", username);
    });

    socket.on("getHistory", async ({ roomId }) => {
      try {
        const messages = await getMessagesByRoomId(roomId);
        socket.emit("history", messages);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    });
  });
}
