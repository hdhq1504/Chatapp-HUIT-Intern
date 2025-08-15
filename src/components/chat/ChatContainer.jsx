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
  onMessageSent,
}) {
  const messagesEndRef = useRef(null);

  // Sử dụng custom hook để quản lý chat storage
  const {
    messages,
    isLoading,
    addMessage: addStorageMessage,
  } = useChatStorage(selectedContact?.id);

  // Auto scroll to bottom
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

    // Lưu vào storage và nhận lại message đã lưu (có id & timestamp)
    const saved = addStorageMessage(newMessage);

    // Gọi callback để cập nhật sidebar / contacts
    if (onMessageSent && selectedContact?.id) {
      onMessageSent(selectedContact.id, saved || newMessage);
    }

    setTimeout(scrollToBottom, 100);
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const updateSharedMedia = (contactId, filesArray, savedMessage) => {
    try {
      const key = `shared_media_${contactId}`;
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : { photos: [], files: [] };

      filesArray.forEach((f, idx) => {
        const entry = {
          id: `${savedMessage?.id || Date.now()}_${idx}`,
          name: f.name,
          size: f.size,
          fileType: f.fileType,
          dataUrl: f.dataUrl, // lưu dataUrl để persist
          timestamp: savedMessage?.timestamp || new Date().toISOString(),
          timestampMs: savedMessage?.timestampMs || Date.now(),
        };

        if (f.fileType === 'image') {
          parsed.photos.unshift(entry);
        } else {
          parsed.files.unshift(entry);
        }
      });

      localStorage.setItem(key, JSON.stringify(parsed));
      window.dispatchEvent(new CustomEvent('shared-media-updated', { detail: { contactId } }));
    } catch (e) {
      console.error('updateSharedMedia error', e);
    }
  };

  // Add file message
  const addFileMessage = async (files, messageText = '') => {
    if (!selectedContact || !files || files.length === 0) return;

    try {
      // Convert tất cả file thành dataURL (base64)
      const processedFiles = await Promise.all(
        files.map(async (fileObj) => {
          const dataUrl = await fileToDataUrl(fileObj.file);
          return {
            name: fileObj.name,
            size: fileObj.size,
            type: fileObj.type,
            fileType: fileObj.fileType,
            // lưu dataUrl để persist qua reload
            dataUrl,
            // vẫn giữ file nếu cần dùng tạm thời (optional)
            file: undefined,
          };
        }),
      );

      const newMessage = {
        type: 'files',
        files: processedFiles,
        sender: 'self',
        senderName: 'Quân Hồ',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
      };

      if (messageText && messageText.trim()) {
        newMessage.text = messageText.trim();
      }

      // Lưu message qua hook/storage (đảm bảo addStorageMessage trả về savedMessage)
      const saved = addStorageMessage(newMessage);

      // Cập nhật shared media trong localStorage (lưu dataUrl)
      if (saved && selectedContact?.id) {
        updateSharedMedia(selectedContact.id, processedFiles, saved);
      }

      // Gọi callback lên trên để cập nhật sidebar
      if (onMessageSent && selectedContact?.id) {
        onMessageSent(selectedContact.id, saved || newMessage);
      }

      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error adding file message:', err);
    }
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
