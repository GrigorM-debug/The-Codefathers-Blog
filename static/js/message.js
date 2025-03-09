//Logic for handeling messages
import { io } from "socket.io-client";

const socketClient = io();

const inputTextElement = document.getElementById("chat-text");
const sendButtonElement = document.getElementById("send-button");
const roomIdElement = document.getElementById("room-id");

const roomId = roomIdElement.textContent;

function handleSendMessage() {
  const text = inputTextElement.value;

  if ((text, roomId)) {
    console.log(text);
    socketClient.emit("message", { roomId, senderId: socketClient.id, text });
    inputTextElement.value = "";
  }
}

inputTextElement.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSendMessage();
  }
});

sendButtonElement.addEventListener("click", () => {
  handleSendMessage();
});
