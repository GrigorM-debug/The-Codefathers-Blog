import { updateUserSocketId } from "../services/user.js";
import { createMessage } from "../services/message.js";
import { userExistByUsername } from "../services/user.js";

export async function handleSocketConnection(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    //This is listening for join event trigger for joining rooms
    socket.on("join", async ({ username, roomId }) => {
      console.log("Join event received");

      const socketId = socket.id;

      console.log(socketId);

      console.log(roomId);
      console.log(username);
      const isUserExisting = await userExistByUsername(username);

      if (isUserExisting) {
        await updateUserSocketId(username, socketId);
        socket.join(roomId);
        console.log(`${username} joined room: ${roomId}`);

        //Emit event back to the client
        socket.emit("roomJoined", { roomId });
      }
    });

    socket.on("message", async ({ roomId, senderId, text }) => {
      const message = await createMessage(roomId, senderId, text);
      io.to(roomId).emit("message", message);
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
