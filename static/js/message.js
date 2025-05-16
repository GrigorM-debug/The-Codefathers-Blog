//Logic for handeling messages
import { io } from "socket.io-client";

const socketClient = io();

const inputTextElement = document.getElementById("chat-text");
const sendButtonElement = document.getElementById("send-button");
const roomIdElement = document.getElementById("room-id");

const roomId = roomIdElement.textContent;

socketClient.emit("join", {
  username: document.querySelector("[data-username]").dataset.username,
  roomId,
});

function handleSendMessage() {
  const text = inputTextElement.value.trim();

  if (text && roomId) {
    // Send message to server
    fetch("/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId: socketClient.id,
        roomId: roomId,
        username: document.querySelector("[data-username]").dataset.username,
        text: text,
      }),
    });

    // Emit socket event
    socketClient.emit("message", { roomId, text });
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

function createMessageElement(message) {
  const li = document.createElement("li");
  li.className = "clearfix";

  const currentUsername =
    document.querySelector("[data-username]").dataset.username;
  const isOwnMessage = message.sender.username === currentUsername;

  //Create message data div tag
  const messageDataDiv = document.createElement("div");
  messageDataDiv.className = `message-data ${isOwnMessage ? "text-right" : ""}`;

  //Create message data and time span
  const dataAndTimeSpan = document.createElement("span");
  dataAndTimeSpan.className = "message-data-time";
  dataAndTimeSpan.textContent = message.createdAt;
  messageDataDiv.appendChild(dataAndTimeSpan);

  //Create sender username paragraph
  const userNameParagrapgh = document.createElement("p");
  userNameParagrapgh.textContent = message.sender.username;
  messageDataDiv.appendChild(userNameParagrapgh);

  //Create sender image url tag
  const senderImageUrl = document.createElement("img");
  senderImageUrl.src = message.sender.imageUrl;
  senderImageUrl.alt = "avatar";
  messageDataDiv.appendChild(senderImageUrl);

  li.appendChild(messageDataDiv);

  //Create message text div tag
  const messageTextDiv = document.createElement("div");
  messageTextDiv.className = `message ${isOwnMessage ? "my-float-right" : "other-message float-right"}`;
  messageTextDiv.textContent = message.text;
  li.appendChild(messageTextDiv);

  return li;
}

socketClient.on("message", (message) => {
  createMessageElement(message);
});
