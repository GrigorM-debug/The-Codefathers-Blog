import { io } from "socket.io-client";

console.log("Socket client initialized");

const socketClient = io();

socketClient.on("connect", () => {
  const userId = userElement.getAttribute("data-user-id");
  socketClient.emit("join", { userId, roomId });
  socketClient.emit("getHistory", { roomId });
});

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

const ul = document.querySelector(".chat-history ul");

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
  dataAndTimeSpan.textContent = message.message.createdAt;
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
  const liMessageElement = createMessageElement(message);
  ul.appendChild(liMessageElement);
  ul.scrollTop = ul.scrollHeight;
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
  socketClient.emit("leave", { roomId, username });
});

socketClient.on("history", (messages) => {
  ul.innerHTML = ""; // Clear the chat history
  messages.forEach((msg) => {
    // ensure shape matches createMessageElement
    const formatted = {
      sender: {
        username: msg.sender.username,
        imageUrl: msg.sender.imageUrl,
        _id: msg.sender._id,
      },
      text: msg.text,
      createdAt: msg.createdAt,
    };
    const li = createMessageElement(formatted);
    ul.appendChild(li);
  });

  // scroll to bottom
  ul.scrollTop = ul.scrollHeight;
});
