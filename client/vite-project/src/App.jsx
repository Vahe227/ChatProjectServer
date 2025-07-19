import { useState,useEffect } from 'react';
import './App.css';
import client from 'socket.io-client';

const socket = client.io('http://localhost:5634');

function App() {
  const [currentInput, setCurrentInput] = useState("");
  const [myClientId,setMyClientId] = useState(null);
  const [allConnectedUsers, setAllConnectedUsers] = useState([]);
  const [allChatMessages,setAllChatMessages] = useState([]);

  useEffect(() => {
    socket.on('client-id', (clientId) => {
      setMyClientId(clientId);
    });
    socket.on('all-clients', (allClients) => {
        setAllConnectedUsers(allClients);
        console.log('All Users: ' , allClients);
    });
    
    socket.on('all-messages', (messagesServer) => {
      setAllChatMessages(messagesServer);
      console.log(messagesServer);
    });
    return () => {
      socket.off('client-id');
      socket.off('all-messages');
      socket.off('all-clients');
    };
  }, []);

  const handleSendMessage = () => {
    if(currentInput.trim() !== "") {
      socket.emit('all-clients-messages', currentInput);
      setCurrentInput("");
    };
  };

  return (
    <>
      <div className='chatMessages'> 
        {allChatMessages.map((msg,index) => {
          const isMyMessage = msg.id === myClientId;

          if(isMyMessage) {
            return (
              <p className='my-chat-message'
                key={index}
              >{msg.text} 'from: ' {msg.id}
              </p>
            )
          } else {
            return (
              <p className='all-client-message'
                key={index}
                >{msg.text} 'from: ' {msg.id}
              </p>
            )
          }
        })}
      </div>
      <div>
        <input type='text' value={currentInput} onChange={(evt) => {
            setCurrentInput(evt.target.value);
        }} onKeyPress={(evt) => {
          if (evt.key === 'Enter') {
            handleSendMessage();
          };
        }}
        placeholder='Write Something'>
        </input>
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </>
  )
}

export default App;

