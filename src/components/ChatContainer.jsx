import React, { useEffect, useRef, useState } from "react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import { getMessagesByUserId, formatTime } from "../utils/string.jsx";
import MessageHeader from "./MessageHeader.jsx";
import MessageBubble from "./MessageBubble.jsx";
import InputMessage from "./InputMessage.jsx";

function ChatContainer({ 
  setShowDetails, 
  onBackToSidebar,
  showSidebar, 
  setShowSidebar, 
  selectedContact
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);

  const detectMessageType = (message) => {
    if (typeof message === 'string' && (message.includes('.png') || message.includes('.jpg') || message.includes('.jpeg') || message.includes('.gif'))) {
      return 'image';
    }

    if (typeof message === 'object' && message !== null) {
      return 'image';
    }

    if (message.includes('.mp4') || message.includes('.mov')) {
      return 'video';
    }
    
    if (message.includes('.pdf') || message.includes('.doc')) {
      return 'document';
    }

    return 'text';
  };

  useEffect(() => {
    if (selectedContact?.id) {
      const contactMessages = getMessagesByUserId(selectedContact.id);
      const formattedMessages = contactMessages.map(msg => {
        const messageType = detectMessageType(msg.message);
        return {
          id: msg.id,
          type: messageType,
          content: msg.message,
          timestamp: formatTime(msg.timestamp),
          sender: msg.isMe ? "self" : "other",
          senderName: msg.senderName
        };
      });
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const addMessage = (messageContent) => {
    if (!messageContent.trim() || !selectedContact) return;

    const newMessage = {
      id: Date.now(),
      type: "text",
      content: messageContent.trim(),
      timestamp: formatTime(new Date().toISOString()),
      sender: "self",
      senderName: "Quân Hồ"
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const addImageMessage = (imageFile) => {
    if (!imageFile || !selectedContact) return;
    const imageUrl = URL.createObjectURL(imageFile);
    addMessage(imageUrl, "image");
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-shrink-0">
        <MessageHeader 
          setShowDetails={setShowDetails}
          onBackToSidebar={onBackToSidebar}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          selectedContact={selectedContact}
        />
      </div>
      
      <div 
        ref={messagesContainerRef}
        className={`
          flex-1 overflow-y-auto overflow-x-hidden
          px-3 md:px-4 py-4
          scroll-smooth
          ${customScrollbarStyles}
        `}
      >
        <div className="space-y-1">
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const nextMessage = messages[index + 1];
            
            const isFirstInGroup = !prevMessage || prevMessage.sender !== message.sender;
            const isLastInGroup = !nextMessage || nextMessage.sender !== message.sender;
            const isGrouped = !isFirstInGroup && !isLastInGroup;
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isFirst={isFirstInGroup}
                isLast={isLastInGroup}
                isGrouped={isGrouped}
              />
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="h-4 flex-shrink-0" />
      </div>

      <div className="flex-shrink-0">
        <InputMessage 
          onSendMessage={addMessage}
          onSendImage={addImageMessage}
          disabled={!selectedContact}
        />
      </div>
    </div>
  );
}

export default ChatContainer;
