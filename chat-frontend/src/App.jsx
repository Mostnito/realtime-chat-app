import {useState, useEffect} from 'react';
import {io} from 'socket.io-client';
const socket = io('http://localhost:3000');

function App(){
  
  const [username, setUsername] = useState(localStorage.getItem('username') || "Anonymous");
  const [prepare, setPrepare] = useState("");
  const [message, setMessage] = useState("");
  const [messages_list, setMessages_list] = useState([]);

  function setUsernamefunc(e){
    e.preventDefault();
    const name = prepare;
    setUsername(name);
    const nameData = {
      prevname: username,
      username: name
    }
    localStorage.setItem('username', name);
    socket.emit('user_change_name', nameData);
  }



  function sendMessage(e){
    e.preventDefault();
    if (message.trim() !== ""){
      const messageData = {
        username: username,
        Issystem: false,
        message: message,
        time: new Date().toLocaleTimeString()
      }
        socket.emit('send_message', {messageData});
        setMessage("")
    }

    
    }

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log("Received message:", data.messageData);
      const [username, message, time] = [data.messageData.username, data.messageData.message, data.messageData.time];
      setMessages_list((prev) => [...prev, data.messageData]);
    }

    const handleUserConnected = (username) => {
      console.log(`User Connected: ${username}`);
      const systemMessage = {
        username: "System",
        Issystem: true,
        message: `${username} has joined the chat`,
        time: new Date().toLocaleTimeString()
      }
      setMessages_list((prev) => [...prev, systemMessage]);
    }

    const UserChangeName = (data) => {
      console.log(`Change Name: ${data.prevname} to ${data.username}`);
      const systemMessage = {
        username: "System",
        Issystem: true,
        message: `${data.prevname} has changed name to ${data.username}`,
        time: new Date().toLocaleTimeString()
      }
      setMessages_list((prev) => [...prev, systemMessage]);
    }

    const handleUserDisconnected = (username) => {
      console.log(`User Disconnected: ${username}`);
      const systemMessage = {
        username: "System",
        Issystem: true,
        message: `${username} has left the chat`,
        time: new Date().toLocaleTimeString()
      }
      setMessages_list((prev) => [...prev, systemMessage]);
    }

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_connected', handleUserConnected);
    socket.on('user_disconnected', handleUserDisconnected);
    socket.on('user_change_name', UserChangeName);

    socket.on('connect', () => {
      socket.emit('user_connected', username);
    })

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_connected', handleUserConnected);
      socket.off('user_disconnected', handleUserDisconnected);
      socket.off('user_change_name', UserChangeName);
      socket.off('connect');
    };
  },[])
  
  return (
    <div className="App">
      <h1>Chat Application</h1>
      <div className="card">
          <div className="card-header">
            {username}
          </div>

          <div className="card-body">
               <div className="input-group">
                <label>ชื่อของคุณ</label>
                <input onChange={(e)=>{setPrepare(e.target.value)}} type="text" placeholder="yourname"/>
                <button onClick={(e)=>{setUsernamefunc(e)}}>ยืนยัน</button>
               </div>
          </div>

          <div className="message-box">
            <ul className="list-group" id='message-list'></ul>
              {messages_list.map((messageData, index) => (
                <li key={index} className="list-group-item">
                  {messageData.Issystem ? (
                    <>
                  {messageData.message} <span className="time">{messageData.time}</span>
                    </>
                  ) : (
                    <>
                    <span><strong>{messageData.username}</strong>: {messageData.message} <span className="time">{messageData.time}</span></span>
                    </>
                  )}
                  
                </li>
              ))}
            <div className="info"></div>
          </div>

          <div className="card-footer">
            <div className="input-group">
              <input onChange={(e)=>{setMessage(e.target.value)}} type="text" placeholder="Type a message..." value={message} />
              <button onClick={sendMessage}>ส่ง</button>
            </div>
          </div>
      </div>
          
    </div>
  );
}

export default App;