import { updateUserSocketId } from "../services/user.js";
import { createMessage } from "../services/message.js";
import { userExistByUsername } from "../services/user.js";

export async function handleSocketConnection(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    //This is listening for join event trigger for joining rooms
    socket.on("join", async ({ username, roomId }) => {
      const sockerId = socket.id;

      const isUserExisting = await userExistByUsername(username);

      if (isUserExisting) {
        await updateUserSocketId(username, sockerId);
        socket.join(roomId);
        console.log(`${username} joined room: ${roomId}`);
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
