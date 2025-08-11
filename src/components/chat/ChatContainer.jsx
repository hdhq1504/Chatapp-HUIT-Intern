import React, { useEffect, useRef, useState } from 'react';
import { customScrollbarStyles } from '../../utils/styles.jsx';
import { getMessagesByUserId } from '../../utils/string.jsx';
import {
  processMessagesForRendering,
  findUnreadStartIndex,
} from '../../utils/messageUtils.jsx';
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
  const messagesRef = useRef([]);

  const SHARED_MEDIA_KEY_PREFIX = 'shared_media_';

  const getSharedMediaKey = (contactId) => `${SHARED_MEDIA_KEY_PREFIX}${contactId}`;

  const loadImageElement = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const imageFileToCompressedDataUrl = async (
    file,
    { maxWidth = 1280, maxHeight = 1280, quality = 0.8 } = {},
  ) => {
    try {
      const objectUrl = URL.createObjectURL(file);
      const img = await loadImageElement(objectUrl);

      let { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      const targetWidth = Math.round(width * ratio);
      const targetHeight = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Export as JPEG to reduce size
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      URL.revokeObjectURL(objectUrl);
      return dataUrl;
    } catch (err) {
      // Fallback to plain FileReader data URL
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const persistSharedMedia = async (contactId, files) => {
    if (!contactId || !files || files.length === 0) return;

    const key = getSharedMediaKey(contactId);
    let current = { photos: [], files: [] };
    try {
      const raw = localStorage.getItem(key);
      if (raw) current = JSON.parse(raw);
    } catch {}

    const newPhotos = [];
    const newFiles = [];

    for (const f of files) {
      const baseItem = {
        name: f.name,
        size: f.size,
        fileType: f.fileType,
        timestamp: Date.now(),
      };

      if (f.fileType === 'image' && f.file instanceof File) {
        try {
          const dataUrl = await imageFileToCompressedDataUrl(f.file, {
            maxWidth: 1280,
            maxHeight: 1280,
            quality: 0.8,
          });
          newPhotos.push({ ...baseItem, dataUrl });
        } catch {
          // skip on failure
        }
      } else {
        // For small files, store a dataUrl to enable download later from ChatInfo
        if (f.file instanceof File && f.size <= 300 * 1024) {
          try {
            const dataUrl = await fileToDataUrl(f.file);
            newFiles.push({ ...baseItem, dataUrl });
          } catch {
            newFiles.push(baseItem);
          }
        } else {
          newFiles.push(baseItem);
        }
      }
    }

    // Keep only the most recent 60 items to avoid exceeding localStorage limits
    const next = {
      photos: [...current.photos, ...newPhotos].slice(-60),
      files: [...current.files, ...newFiles].slice(-60),
    };

    try {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(
        new CustomEvent('shared-media-updated', {
          detail: { contactId },
        }),
      );
    } catch (e) {
      // If quota exceeded, progressively trim and retry once
      try {
        const trimmed = {
          photos: next.photos.slice(-30),
          files: next.files.slice(-30),
        };
        localStorage.setItem(key, JSON.stringify(trimmed));
        window.dispatchEvent(
          new CustomEvent('shared-media-updated', {
            detail: { contactId },
          }),
        );
      } catch {
        // give up silently
      }
    }
  };

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
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    // Revoke any blob URLs only when component unmounts
    return () => {
      const current = messagesRef.current || [];
      current.forEach((message) => {
        if (message.type === 'files' && message.files) {
          message.files.forEach((file) => {
            if (file.url && typeof file.url === 'string' && file.url.startsWith('blob:')) {
              URL.revokeObjectURL(file.url);
            }
            if (
              file.preview &&
              typeof file.preview === 'string' &&
              file.preview.startsWith('blob:') &&
              file.preview !== file.url
            ) {
              URL.revokeObjectURL(file.preview);
            }
          });
        }
        if (message.type === 'image' && message.content && typeof message.content === 'string' && message.content.startsWith('blob:')) {
          // If single-image messages used blob URLs, revoke on unmount
          try { URL.revokeObjectURL(message.content); } catch {}
        }
      });
    };
  }, []);

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

    // Persist shared media (images as dataURL, others as metadata)
    persistSharedMedia(selectedContact.id, files);
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

    // Persist single image
    persistSharedMedia(selectedContact.id, [
      {
        name: imageFile.name || `image_${Date.now()}`,
        size: imageFile.size || 0,
        fileType: 'image',
        file: imageFile,
      },
    ]);
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
