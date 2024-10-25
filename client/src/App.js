import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect("http://localhost:3001");

function App() {
  // States
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const joinRoom = () => {
    if (room !== "" && username !== "") {
      socket.emit("join_room", room);
    }
  };

  const sendMessage = () => {
    if (message !== "" && room !== "" && username !== "") {
      const messageData = {
        room: room,
        author: username,
        message: message,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]); // Add your own message to the list
      setMessage(""); // Clear the input field after sending
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Clean up the event listener on component unmount
    return () => {
      socket.off("receive_message");
    };
  }, []);

  return (
    <div className="App">
      <div className="joinChatContainer">
        <h3>Join a Chat Room</h3>
        <input
          type="text"
          placeholder="Your Name..."
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Room ID..."
          onChange={(event) => {
            setRoom(event.target.value);
          }}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>

      <div className="chat-window">
        <div className="chat-header">
          <p>Live Chat</p>
        </div>

        <div className="chat-body">
          {messageList.map((msgContent, index) => {
            return (
              <div
                key={index}
                className="message"
                id={username === msgContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{msgContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{msgContent.time}</p>
                    <p id="author">{msgContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="chat-footer">
          <input
            type="text"
            value={message}
            placeholder="Message..."
            onChange={(event) => {
              setMessage(event.target.value);
            }}
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />
          <button onClick={sendMessage}>Send Message</button>
        </div>
      </div>
    </div>
  );
}

export default App;
