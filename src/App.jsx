import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://169.254.167.92:5000');

export default function App() {
  const [chatData, setChatData] = useState([]);
  const [newUser, setNewUser] = useState(true);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('Anon');
  const [users, setUsers] = useState([]);
  const chatRef = useRef(null);
  
  function sendText(msg) {
    if(!msg.trim()) return;
    console.log("sending");

    socket.emit("send_message", {
      user: name,
      msg: msg
    });

    setMessage('')
  };

  useEffect(() => {
    socket.on("new_message", (data) => {
      setChatData(prev => [
        ...prev,
        {
          id: prev.length === 0
            ? 1
            : prev[prev.length - 1].id + 1,
          user: data.user,
          msg: data.msg
        }
      ]);
    });

    return () => {
      socket.off("new_message");
    };
  }, []);

  useEffect(() => {
    const el = chatRef.current;
    if(el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatData])

  return (
    <>
      {newUser &&
        <div id="askUser">
          <h1>Who are you?</h1>
          <input id="unInp" type="text" placeholder='User Name' onChange={(e) => setName(e.target.value)} onKeyDown={(e) => {if(e.key === "Enter"){setNewUser(false);}}} />
          <button type="submit" onClick={() => {setNewUser(false)}}>Confirm</button>
        </div>
      }

      {!newUser &&
        <div id="app">
          <div id="navbar">
            <span>Online: <b>{users.length}</b></span>
            <span>{name}</span>
            <button onClick={() => {setNewUser(true); setName('Anon'); setMessage('')}}>Log Out</button>
          </div>

          <div id="chat" ref={chatRef}>
            {chatData.map((message) => {
              return (
                <div key={message.id}>
                  <p><b>{message.user}: </b>{message.msg}</p>
                </div>
              )})}
          </div>

          <div id="messenger">
            <input id="unInp" type="text" placeholder='Text Message...' value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => {if(e.key === "Enter"){sendText(message)}}} />
            <button type="submit" onClick={() => {sendText(message)}}>⇨</button>
          </div>
        </div>
      }
    </>
  );
};
