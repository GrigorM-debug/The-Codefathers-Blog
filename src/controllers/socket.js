import { updateUserSocketId } from "../services/user.js";
import { createMessage } from "../services/message.js";

export async function handleSocketConnection(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join", async ({ name, roomId }) => {
      const sockerId = socket.id;
      await updateUserSocketId(name, sockerId);
      socket.join(roomId);
      console.log(`${name} joined room: ${roomId}`);
    });

    socket.on("message", async ({ roomId, senderId, username, text }) => {
      const message = await createMessage(roomId, senderId, username, text);
      io.to(roomId).emit("message", message);
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
