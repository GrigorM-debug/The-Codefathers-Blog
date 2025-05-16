import { getUserBySocketId, updateUserSocketId } from "../services/user.js";
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

    socket.on("message", async ({ roomId, text }) => {
      try {
        const user = await getUserBySocketId(socket.id);

        if (!user) {
          return;
        }

        const message = await createMessage(roomId, user._id, text);

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

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
