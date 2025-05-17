import { io } from "socket.io-client";

const socketClient = io();

const userId = document.getElementById("user_id").textContent;

const roomElements = document.querySelectorAll("#room");

socketClient.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

roomElements.forEach((roomElement) => {
  roomElement.addEventListener("click", handleRoomJoin);
});

function handleRoomJoin(e) {
  e.preventDefault();
  const roomId = e.target.getAttribute("room-Id");
  console.log(`User username: ${userId}`);
  console.log(`Room id: ${roomId}`);

  //Add logic for joining rooms
  if (userId && roomId) {
    console.log("Emitting join event");
    socketClient.emit("join", { userId, roomId });
  }
}
