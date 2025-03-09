import { io } from "socket.io-client";

const socketClient = io();

const username = document.getElementById("username").textContent;

const roomElements = document.querySelectorAll("#room");

roomElements.forEach((roomElement) => {
  roomElement.addEventListener("click", handleRoomJoin);
});

function handleRoomJoin(e) {
  const roomId = e.target.getAttribute("room-Id");
  console.log(`User username: ${username}`);
  console.log(`Room id: ${roomId}`);

  //Add logic for joining rooms
  if (username && roomId) {
    socketClient.emit("join", { username, roomId });
  }
}

socketClient.on("roomJoined", (roomId) => {
  window.location.href = `/messages/:${roomId}`;
});
