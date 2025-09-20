import React, { useEffect, useState, useRef } from 'react';
import InputMessage from './InputMessage';
import MessageBubble from './MessageBubble';
import MessageHeader from './MessageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { scrollBar, processMessagesForRendering } from '../storage/helpers';

function ChatContainer({ setShowDetails, onBackToSidebar, selectedContact, onMessageSent }) {
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { sendMessage, getChatHistory, isUserOnline } = useChat();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (selectedContact) {
      const history = getChatHistory(selectedContact.id);
      setMessages(history);
    }
  }, [selectedContact, getChatHistory]);

  useEffect(() => {
    if (!selectedContact) return;

    const pollForNewMessages = () => {
      const history = getChatHistory(selectedContact.id);
      setMessages(history);
    };

    // Poll every second to check for new messages
    const interval = setInterval(pollForNewMessages, 1000);

    return () => clearInterval(interval);
  }, [selectedContact, getChatHistory]);

  useEffect(() => {
    const handleNewMessage = (event) => {
      const { senderId } = event.detail;

      // Nếu đang chat với người vừa gửi tin nhắn
      if (selectedContact && selectedContact.id === senderId) {
        const history = getChatHistory(selectedContact.id);
        setMessages(history);
        scrollToBottom();
      }
    };

    window.addEventListener('message-received', handleNewMessage);

    return () => {
      window.removeEventListener('message-received', handleNewMessage);
    };
  }, [selectedContact, getChatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageContent) => {
    if (!selectedContact) return;

    const trimmedContent = messageContent?.trim();
    if (trimmedContent) return;

    try {
      const messageData = {
        content: trimmedContent,
        type: 'text',
        timestamp: Date.now(),
        sender: 'self',
        senderName: user?.name || user?.username || 'You',
        senderAvatar: user?.avatar,
      };

      // Send through chat context
      const result = await sendMessage(selectedContact.id, messageData, selectedContact.type || 'contact');

      if (result.success) {
        // Update local messages
        setMessages((prev) => [...prev, result.messageData]);

        // Notify parent component
        if (onMessageSent) {
          onMessageSent(selectedContact.id, result.messageData);
        }
      } else {
        console.error('Failed to send message:', result.error);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred while sending the message.');
    }
  };

  const renderContactStatus = () => {
    if (selectedContact.type === 'group') {
      return `${selectedContact.members?.length || 0} members`;
    } else {
      const online = isUserOnline(selectedContact.id);
      return online ? 'Online' : 'Last seen recently';
    }
  };

  const processedMessages = processMessagesForRendering(messages);

  return (
    <div className='flex h-full w-full flex-col'>
      {/* Header */}
      <div className='flex-shrink-0'>
        <MessageHeader
          setShowDetails={setShowDetails}
          onBackToSidebar={onBackToSidebar}
          selectedContact={selectedContact}
          contactStatus={renderContactStatus()}
        />
      </div>

      {/* Messages Container */}
      <div className={`flex-1 overflow-x-hidden overflow-y-auto scroll-smooth px-3 py-4 md:px-4 ${scrollBar}`}>
        <div className='space-y-1'>
          {processedMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isFirst={message.isFirst}
              isLast={message.isLast}
              isGrouped={message.isGrouped}
              isNewSession={message.isNewSession}
              timeSeparator={message.timeSeparator}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className='h-4 flex-shrink-0' />
      </div>

      {/* Input */}
      <div className='flex-shrink-0'>
        <InputMessage onSendMessage={handleSendMessage} disabled={!selectedContact} />
      </div>
    </div>
  );
}

export default ChatContainer;
