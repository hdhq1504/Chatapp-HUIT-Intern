import React, { useEffect, useRef } from 'react';
import { customScrollbarStyles } from '../../utils/styles.jsx';
import { useChatStorage } from '../../hooks/useChatStorage.jsx';
import { processMessagesForRendering } from '../../utils/messageUtils.jsx';
import MessageHeader from './MessageHeader.jsx';
import MessageBubble from './MessageBubble.jsx';
import InputMessage from './InputMessage.jsx';

function ChatContainer({
  setShowDetails,
  onBackToSidebar,
  showSidebar,
  setShowSidebar,
  selectedContact,
}) {
  const messagesEndRef = useRef(null);

  // Sử dụng custom hook để quản lý chat storage
  const {
    messages,
    isLoading,
    addMessage: addStorageMessage,
  } = useChatStorage(selectedContact?.id);

  // Auto scroll to bottom khi có messages mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add text message
  const addMessage = (messageContent) => {
    if (!messageContent.trim() || !selectedContact) return;

    const newMessage = {
      type: 'text',
      content: messageContent.trim(),
      sender: 'self',
      senderName: 'Quân Hồ',
    };

    addStorageMessage(newMessage);
    setTimeout(scrollToBottom, 100);
  };

  // Add file message
  const addFileMessage = (files, messageText = '') => {
    if (!selectedContact || !files || files.length === 0) return;

    const processedFiles = files.map((fileObj) => ({
      name: fileObj.name,
      size: fileObj.size,
      type: fileObj.type,
      fileType: fileObj.fileType,
      file: fileObj.file,
      url: URL.createObjectURL(fileObj.file),
      preview: URL.createObjectURL(fileObj.file),
    }));

    const newMessage = {
      type: 'files',
      files: processedFiles,
      sender: 'self',
      senderName: 'Quân Hồ',
    };

    if (messageText && messageText.trim()) {
      newMessage.text = messageText.trim();
    }

    addStorageMessage(newMessage);
    setTimeout(scrollToBottom, 100);
  };

  // Process messages for rendering
  const processedMessages = processMessagesForRendering(messages);

  // Hiển thị loading state
  if (isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='text-gray-500'>Loading messages...</div>
      </div>
    );
  }

  return (
    <div className='flex h-full w-full flex-col'>
      {/* Header */}
      <div className='flex-shrink-0'>
        <MessageHeader
          setShowDetails={setShowDetails}
          onBackToSidebar={onBackToSidebar}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          selectedContact={selectedContact}
        />
      </div>

      {/* Messages Container */}
      <div
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
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className='h-4 flex-shrink-0' />
      </div>

      {/* Input */}
      <div className='flex-shrink-0'>
        <InputMessage
          onSendMessage={addMessage}
          onSendFile={addFileMessage}
          disabled={!selectedContact}
        />
      </div>
    </div>
  );
}

export default ChatContainer;
