import { useState, useEffect } from "react";
import "./App.css";

interface Message {
  id: number;
  body: string;
}

const ws = new WebSocket("ws://localhost:3000/cable");
function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [guid, setGuid] = useState("");

  ws.onopen = () => {
    console.log("connected to message server");
    setGuid(Math.random().toString(36).substring(2, 15));

    ws.send(
      JSON.stringify({
        command: "subscribe",
        identifier: JSON.stringify({
          id: guid,
          channel: "MessagesChannel",
        }),
      })
    );
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "ping") return;
    if (data.type === "welcome") return;
    if (data.type === "confirm_subscription") return;

    const message = data.message;
    setMessages([...messages, message]);
  };

  useEffect(() => {
    fetchMessages();
  }, [messages]);

  const fetchMessages = async () => {
    const response = await fetch("http://localhost:3000/messages");
    const data = await response.json();
    setMessages(data);
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const body = (e.target as HTMLFormElement).message.value;
  (e.target as HTMLFormElement).message.value = "";

  await fetch("http://localhost:3000/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body }),
  });
};

  return (
    <>
      <div> guid :{guid}</div>
      <div className="messages" id="messages">
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((message) => (
            <div className="message" key={message.id}>
              <p>{message.body}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <input className="messageInput" type="text" name="message" />
        <button className="messageButton" type="submit">
          Send
        </button>
      </form>
    </>
  );
}

export default App;
