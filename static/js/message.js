//Logic for handeling messages
import { io } from "socket.io-client";

const socketClient = io("ws://localhost:3000");

const roomJoinedElement = document.getElementById("room-joined");

//When user enters the room
socketClient.on("roomJoined", (message) => {
  roomJoinedElement.textContent = message;
});

const inputTextElement = document.getElementById("chat-text");
const sendButtonElement = document.getElementById("send-button");
const roomIdElement = document.getElementById("room-id");

const activity = document.querySelector(".activity");

const roomId = roomIdElement.textContent;

const messageFormElement = document.querySelector(".form-msg");

const userElement = document.getElementById("current_user");

const username = userElement.getAttribute("data-username");

function handleSendMessage(e) {
  e.preventDefault();
  const text = inputTextElement.value.trim();
  console.log("Text: ", text);

  if (text && roomId) {
    console.log("Sending message: ", text);
    // Emit socket event
    socketClient.emit("message", { roomId, text });
    inputTextElement.value = "";
  }
  inputTextElement.focus();
}

inputTextElement.addEventListener("keypress", () => {
  socketClient.emit("activity", { roomId, username });
});

inputTextElement.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSendMessage(e);
  }
});

sendButtonElement.addEventListener("click", (e) => {
  handleSendMessage(e);
});

messageFormElement.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSendMessage;
});

//Creating the li element for the message
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

//Listen for message activity event triggered from the server
socketClient.on("message", (message) => {
  createMessageElement(message);
});

//Listen for activity (when user is typing) event triggered from the server
let activityTimer;
socketClient.on("activity", (username) => {
  activity.textContent = `${username} is typing...`;
  //Clear after 2 seconds
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 2000);
});

//Leaving the room
const leaveRoomButton = document.getElementById("leave-room");

leaveRoomButton.addEventListener("click", () => {
  socketClient.emit("disconnect", { roomId, username });
});
