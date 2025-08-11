import React, { useEffect, useRef, useState } from 'react';
import { customScrollbarStyles } from '../utils/styles.jsx';
import { getMessagesByUserId } from '../utils/string.jsx';
import {
  processMessagesForRendering,
  findUnreadStartIndex,
} from '../utils/messageUtils.jsx';
import MessageHeader from './MessageHeader.jsx';
import MessageBubble from './MessageBubble.jsx';
import InputMessage from './InputMessage.jsx';

function ChatContainer({
  setShowDetails,
  onBackToSidebar,
  showSidebar,
  setShowSidebar,
  selectedContact,
  lastReadMessageId,
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);

  const detectMessageType = (message) => {
    if (
      typeof message === 'string' &&
      (message.includes('.png') ||
        message.includes('.jpg') ||
        message.includes('.jpeg') ||
        message.includes('.gif'))
    ) {
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
      const formattedMessages = contactMessages.map((msg) => {
        const messageType = detectMessageType(msg.message);
        return {
          id: msg.id,
          type: messageType,
          content: msg.message,
          timestamp: msg.timestamp,
          sender: msg.isMe ? 'self' : 'other',
          senderName: msg.senderName,
        };
      });
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      messages.forEach((message) => {
        if (message.type === 'files' && message.files) {
          message.files.forEach((file) => {
            if (file.url && file.url.startsWith('blob:')) {
              URL.revokeObjectURL(file.url);
            }
            if (
              file.preview &&
              file.preview.startsWith('blob:') &&
              file.preview !== file.url
            ) {
              URL.revokeObjectURL(file.preview);
            }
          });
        }
      });
    };
  }, [messages]);

  const addMessage = (messageContent) => {
    if (!messageContent.trim() || !selectedContact) return;

    const newMessage = {
      id: Date.now(),
      type: 'text',
      content: messageContent.trim(),
      timestamp: new Date().toISOString(),
      sender: 'self',
      senderName: 'Quân Hồ',
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const addFileMessage = (files, messageText = '') => {
    if (!selectedContact || !files || files.length === 0) return;

    const processedFiles = files.map((fileObj) => {
      const fileUrl = URL.createObjectURL(fileObj.file);

      return {
        name: fileObj.name,
        size: fileObj.size,
        type: fileObj.type,
        fileType: fileObj.fileType,
        file: fileObj.file,
        url: fileUrl,
        preview: fileUrl,
      };
    });

    const timestamp = new Date().toISOString();
    const newMessages = [];

    const fileMessage = {
      id: Date.now(),
      type: 'files',
      files: processedFiles,
      timestamp: timestamp,
      sender: 'self',
      senderName: 'Quân Hồ',
    };

    if (messageText && messageText.trim()) {
      fileMessage.text = messageText.trim();
    }

    newMessages.push(fileMessage);

    setMessages((prev) => [...prev, ...newMessages]);

    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const addImageMessage = (imageFile) => {
    if (!imageFile || !selectedContact) return;
    const imageUrl = URL.createObjectURL(imageFile);

    const newMessage = {
      id: Date.now(),
      type: 'image',
      content: imageUrl,
      timestamp: new Date().toISOString(),
      sender: 'self',
      senderName: 'Quân Hồ',
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const unreadStartIndex = findUnreadStartIndex(messages, lastReadMessageId);
  const processedMessages = processMessagesForRendering(
    messages,
    unreadStartIndex,
  );

  return (
    <div className='flex h-full w-full flex-col'>
      <div className='flex-shrink-0'>
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
        className={`flex-1 overflow-x-hidden overflow-y-auto scroll-smooth px-3 py-4 md:px-4 ${customScrollbarStyles}`}
      >
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
              showUnreadDivider={message.showUnreadDivider}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className='h-4 flex-shrink-0' />
      </div>

      <div className='flex-shrink-0'>
        <InputMessage
          onSendMessage={addMessage}
          onSendFile={addFileMessage}
          onSendImage={addImageMessage}
          disabled={!selectedContact}
        />
      </div>
    </div>
  );
}

export default ChatContainer;
