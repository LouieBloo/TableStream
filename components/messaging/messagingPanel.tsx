import React, { useEffect, useRef, useState } from 'react';
import { webrtcService } from '../../services/webRTCService';
import { Message } from '../../interfaces/messages';

const MessagingPanel: React.FC = () => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {

    const messageAdded = (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    webrtcService.subscribeToMessage(messageAdded);

    return () => {
      webrtcService.unSubscribeToMessage(messageAdded);
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      webrtcService.sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>

      <ul>
        {messages.map((msg:Message) => (
          <div key={msg.message}>
            <strong>{msg.playerName}</strong>: {msg.message}
          </div>
        ))}
      </ul>
    </div>
  )
};

export default MessagingPanel;
