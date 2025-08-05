import React, { useEffect, useRef } from "react";
import Photo1 from "../assets/images/photo_2025_1.png";
import Photo3 from "../assets/images/photo_2025_3.png";
import { customScrollbarStyles } from "../utils/styles.jsx";
import MessageHeader from "./MessageHeader.jsx";
import MessageBubble from "./MessageBubble.jsx";
import InputMessage from "./InputMessage.jsx";

// Dữ liệu mẫu
const messages = [
  {
    id: 1,
    type: "image", // Loại tin nhắn: "text, image, voice, sticker"
    content: Photo1, // Nội dung tin nhắn
    timestamp: "48 minutes ago",
    sender: "other", // Người gửi: "self" (tôi) hoặc "other" (người khác)
  },
  {
    id: 2,
    type: "text",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    timestamp: "48 minutes ago",
    sender: "self",
  },
  {
    id: 3,
    type: "text",
    content: "Sounds fun! Let me know",
    timestamp: "48 minutes ago",
    sender: "other",
  },
  {
    id: 4,
    type: "text",
    content: "if you need company",
    timestamp: "47 minutes ago",
    sender: "other",
  },
  {
    id: 5,
    type: "text",
    content: "Oke, I'll let you know",
    timestamp: "45 minutes ago",
    sender: "self",
  },
  {
    id: 6,
    type: "text",
    content: "!",
    timestamp: "35 minutes ago",
    sender: "other",
  },
  {
    id: 7,
    type: "text",
    content: "Hey, how are you doing today? I was thinking we could maybe grab some coffee later if you're free. What do you think?",
    timestamp: "30 minutes ago",
    sender: "other",
  },
  {
    id: 8,
    type: "image",
    content: Photo3,
    timestamp: "28 minutes ago",
    sender: "self",
  },
  {
    id: 9,
    type: "text",
    content: "Perfect! See you at 3 PM?",
    timestamp: "25 minutes ago",
    sender: "other",
  },
  {
    id: 10,
    type: "text",
    content: "Yes, see you there! 😊",
    timestamp: "20 minutes ago",
    sender: "self",
  },
  {
    id: 11,
    type: "text",
    content: "Great! Looking forward to it. By the way, have you tried their pastries before?",
    timestamp: "18 minutes ago",
    sender: "other",
  },
  {
    id: 12,
    type: "text",
    content: "No, I haven't! Are they good?",
    timestamp: "15 minutes ago",
    sender: "self",
  },
  {
    id: 13,
    type: "text",
    content: "They're amazing! Especially the chocolate croissants. You should definitely try one.",
    timestamp: "12 minutes ago",
    sender: "other",
  },
  {
    id: 14,
    type: "text",
    content: "Sounds delicious! I'll make sure to order one. Thanks for the recommendation!",
    timestamp: "10 minutes ago",
    sender: "self",
  },
  {
    id: 15,
    type: "text",
    content: "You're welcome! See you soon! 🌟",
    timestamp: "8 minutes ago",
    sender: "other",
  }
];

/**
 * Component chính chứa nội dung chat
 * @param {Function} setShowDetails - Hàm để toggle hiển thị panel chi tiết
 * @param {Function} onBackToSidebar - Hàm quay lại sidebar (mobile)
 * @param {boolean} isMobile - Kiểm tra có phải mobile không
 * @param {boolean} isTablet - Kiểm tra có phải tablet không
 * @param {boolean} showSidebar - Trạng thái hiển thị sidebar
 * @param {Function} setShowSidebar - Hàm toggle sidebar
 */
function ChatContainer({ 
  setShowDetails, 
  onBackToSidebar, 
  isMobile, 
  isTablet, 
  showSidebar, 
  setShowSidebar 
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom khi component mount hoặc có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0">
        <MessageHeader 
          setShowDetails={setShowDetails}
          onBackToSidebar={onBackToSidebar}
          isMobile={isMobile}
          isTablet={isTablet}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
      </div>
      
      {/* Messages Area - Scrollable */}
      <div 
        ref={messagesContainerRef}
        className={`
          flex-1 overflow-y-auto overflow-x-hidden
          ${isMobile ? 'px-3 py-4' : 'px-4 py-4'}
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
                isMobile={isMobile}
                isTablet={isTablet}
              />
            );
          })}
          
          {/* Div để đánh dấu cuối danh sách tin nhắn */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Spacer để tránh input che tin nhắn cuối */}
        <div className="h-4 flex-shrink-0" />
      </div>

      {/* Input Message - Fixed */}
      <div className="flex-shrink-0">
        <InputMessage 
          isMobile={isMobile}
          isTablet={isTablet}
        />
      </div>
    </div>
  );
}

export default ChatContainer;
