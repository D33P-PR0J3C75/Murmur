import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('127.0.0.1:5000');

export default function App() {
  const [showUsers, setShowUsers] = useState(false);
  const [chatData, setChatData] = useState([]);
  const [newUser, setNewUser] = useState(true);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('Anon');
  const [users, setUsers] = useState([]);
  const chatRef = useRef(null);

  function uName() {
    let userName = name;
    
    if(users.includes(name)) return;

    if(name.startsWith('ovr')) { // 😈😈😈 Muhahaha... I've got a secret backdoor for myself.
      userName = name.slice(4);
    }

    socket.emit('user_join', userName || 'Anon');
    setName(userName);
    setNewUser(false);
  }
  
  function sendText(msg) {
    if(!msg.trim()) return;
    console.log("sending");

    socket.emit("send_message", {
      user: name,
      msg: msg
    });

    setMessage('')
  };
  
  function getColor(name) {
    const colors = [
       "#afc", "#acf", "#caf", "#cfa", "#fca", "#fac"
    ];

    let hash = 0;

    for(let i=0; i<name.length; i++) {
      hash += name.charCodeAt(i);
    }

    return colors[hash % colors.length];
  }

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

    socket.on("online_list",(names) => {
      setUsers(names);
    })

    return () => {
      socket.off("new_message");
    };
  }, []);

  useEffect(() => {
    const el = chatRef.current;
    if(el) {
      el.scrollTop = el.scrollHeight;
    };
  }, [chatData]);

  return (
    <>
      {newUser &&
        <div id="askUser">
          <h1>Who are you?</h1>
          {users.includes(name) && <p>Username is taken.</p>}
          <input type="text" placeholder="User Name"
          onChange={(e) => setName(e.target.value)} onKeyDown={(e) => {
            if(e.key === 'Enter') {uName()}
            }} />

          <button
          onClick={() => {
            if(!users.includes(name)) {uName()}
            }}>Confirm</button>
        </div>
      }

      {!newUser &&
        <div id="app">
          <div id="navbar">
            <button onClick={() => {setShowUsers(!showUsers)}}>Online: <b>{users.length}</b></button>
            <span>{name}</span>
            <button onClick={() => {setNewUser(true); setName('Anon'); setMessage(''); socket.disconnect();}}>Log Out</button>
          </div>

          {showUsers &&
            <div id="users">
              {users.map((user, index)  => {
                return <span key={index}>{user}</span>
              })}
            </div>
          }

          <div id="chat" ref={chatRef}>
            {chatData.map((message, index) => {
              const showSender = index === 0 || chatData[index - 1].user !== message.user;

              return (
                <div key={message.id} className={message.user === name? 'myText':'text'} style={{
                  background: message.user===name? 'rgba(20, 255, 50, 0.5)':'auto',
                  alignSelf: message.user===name? 'end':'start'
                }}>
                  {showSender && <p className="sender" style={{color: getColor(message.user)}}>{message.user}</p>}
                  <p className='message'>{message.msg}</p>
                </div>
              )})}
          </div>

          <div id="messenger">
            <input id="unInp" type="text" placeholder="Text Message..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter'){sendText(message)}}} />
            <button type="submit" onClick={() => {sendText(message)}}>⇨</button>
          </div>
        </div>
      }
    </>
  );
};
