import React, { useEffect, useState, useRef, useMemo } from 'react';
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

  const chatType = useMemo(() => {
    if (!selectedContact) return 'contact';
    if (selectedContact.type === 'group') {
      return 'room';
    }
    return selectedContact.type || 'contact';
  }, [selectedContact]);

  useEffect(() => {
    if (selectedContact) {
      const history = getChatHistory(selectedContact.id, chatType);
      setMessages(history);
    }
  }, [selectedContact, chatType, getChatHistory]);

  useEffect(() => {
    if (!selectedContact) return;

    const pollForNewMessages = () => {
      const history = getChatHistory(selectedContact.id, chatType);
      setMessages(history);
    };

    // Poll every second to check for new messages
    const interval = setInterval(pollForNewMessages, 1000);

    return () => clearInterval(interval);
  }, [selectedContact, chatType, getChatHistory]);

  useEffect(() => {
    const handleNewMessage = (event) => {
      const { senderId } = event.detail;

      if (chatType !== 'room' && selectedContact && selectedContact.id === senderId) {
        const history = getChatHistory(selectedContact.id, chatType);
        setMessages(history);
        scrollToBottom();
      }
    };

    window.addEventListener('message-received', handleNewMessage);

    return () => {
      window.removeEventListener('message-received', handleNewMessage);
    };
  }, [selectedContact, chatType, getChatHistory]);

  useEffect(() => {
    const handleNewRoomMessage = (event) => {
      const { roomId } = event.detail || {};

      if (chatType === 'room' && selectedContact && selectedContact.id === roomId) {
        const history = getChatHistory(selectedContact.id, chatType);
        setMessages(history);
        scrollToBottom();
      }
    };

    window.addEventListener('room-message-received', handleNewRoomMessage);

    return () => {
      window.removeEventListener('room-message-received', handleNewRoomMessage);
    };
  }, [selectedContact, chatType, getChatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageContent) => {
    if (!selectedContact) return;

    const trimmedContent = messageContent?.trim();
    if (!trimmedContent) return;

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
      const result = await sendMessage(selectedContact.id, messageData, chatType);

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
