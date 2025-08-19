import React, { useEffect, useRef } from 'react';
import { customScrollbarStyles } from '../../utils/styles.jsx';
import { useChatStorage } from '../../hooks/useChatStorage.jsx';
import { processMessagesForRendering } from '../../utils/messageUtils.jsx';
import MessageHeader from './MessageHeader.jsx';
import MessageBubble from './MessageBubble.jsx';
import InputMessage from './InputMessage.jsx';

function ChatContainer({ setShowDetails, onBackToSidebar, showSidebar, setShowSidebar, selectedContact, onMessageSent }) {
  const messagesEndRef = useRef(null);
  const { messages, isLoading, addMessage: addStorageMessage } = useChatStorage(selectedContact?.id);
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (messageContent) => {
    if (!messageContent.trim() || !selectedContact) return;

    const newMessage = {
      type: 'text',
      content: messageContent.trim(),
      sender: 'self',
      senderName: 'Quân Hồ',
    };

    const saved = addStorageMessage(newMessage);

    if (onMessageSent && selectedContact?.id) {
      onMessageSent(selectedContact.id, saved || newMessage);
    }

    setTimeout(scrollToBottom, 100);
  };

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const compressVideo = (file, maxWidth = 720, quality = 0.7) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        const ratio = Math.min(maxWidth / video.videoWidth, maxWidth / video.videoHeight);
        const newWidth = video.videoWidth * ratio;
        const newHeight = video.videoHeight * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        video.currentTime = 1;
      };
      
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality);

        resolve({
          originalDataUrl: URL.createObjectURL(file),
          thumbnailDataUrl: thumbnailDataUrl
        });
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const fileToDataUrl = async (file) => {
    if (file.type.startsWith('image/')) {
      return await compressImage(file);
    } else if (file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) {
        console.warn('Large video file, creating thumbnail only');
        const result = await compressVideo(file);
        return result.thumbnailDataUrl;
      } else {
        return URL.createObjectURL(file);
      }
    } else if (file.type.startsWith('audio/')) {
      return JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
        duration: 0
      });
    } else {
      if (file.size > 50 * 1024 * 1024) {
        return JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type,
          isLargeFile: true
        });
      } else {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }
    }
  };

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
          dataUrl: f.dataUrl,
          timestamp: savedMessage?.timestamp || new Date().toISOString(),
          timestampMs: savedMessage?.timestampMs || Date.now(),
        };

        if (f.fileType === 'image') {
          parsed.photos.unshift(entry);
          if (parsed.photos.length > 100) {
            parsed.photos = parsed.photos.slice(0, 100);
          }
        } else {
          parsed.files.unshift(entry);
          if (parsed.files.length > 50) {
            parsed.files = parsed.files.slice(0, 50);
          }
        }
      });

      try {
        localStorage.setItem(key, JSON.stringify(parsed));
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError') {
          console.warn('SharedMedia storage full, reducing stored items...');
          parsed.photos = parsed.photos.slice(0, 20);
          parsed.files = parsed.files.slice(0, 10);
          localStorage.setItem(key, JSON.stringify(parsed));
          alert('Bộ nhớ đầy, đã xóa media cũ để tiếp tục.');
        } else {
          throw quotaError;
        }
      }

      window.dispatchEvent(new CustomEvent('shared-media-updated', { detail: { contactId } }));
    } catch (e) {
      console.error('updateSharedMedia error', e);
    }
  };

  const addFileMessage = async (files, messageText = '') => {
    if (!selectedContact || !files || files.length === 0) return;


    try {
      const processedFiles = await Promise.all(
        files.map(async (fileObj, index) => {
          console.log(`Processing file ${index + 1}/${files.length}: ${fileObj.name}`);
          
          const dataUrl = await fileToDataUrl(fileObj.file);
          return {
            name: fileObj.name,
            size: fileObj.size,
            type: fileObj.type,
            fileType: fileObj.fileType,
            dataUrl,
            isLargeFile: fileObj.size > 50 * 1024 * 1024
          };
        })
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

      const saved = addStorageMessage(newMessage);

      // Update shared media
      if (saved && selectedContact?.id) {
        updateSharedMedia(selectedContact.id, processedFiles, saved);
      }

      if (onMessageSent && selectedContact?.id) {
        onMessageSent(selectedContact.id, saved || newMessage);
      }

      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error adding file message:', err);
      
      alert('Có lỗi xảy ra khi xử lý file. Vui lòng thử lại.');
    }
  };

  const processedMessages = processMessagesForRendering(messages);

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
      <div className={`flex-1 overflow-x-hidden overflow-y-auto scroll-smooth px-3 py-4 md:px-4 ${customScrollbarStyles}`}>
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
