import React from "react";
import Photo1 from "../assets/images/photo_2025_1.png";
import MessageHeader from "./MessageHeader.jsx";
import MessageBubble from "./MessageBubble.jsx";
import InputMessage from "./InputMessage.jsx";

// Dữ liệu mẫu tin nhắn - có thể chuyển ra file riêng hoặc từ API
const messages = [
  {
    id: 1,
    type: "image", // Loại tin nhắn: "text" hoặc "image"
    content: Photo1, // Nội dung: text hoặc đường dẫn ảnh
    timestamp: "48 minutes ago",
    sender: "other", // Người gửi: "self" (tôi) hoặc "other" (người khác)
  },
  {
    id: 2,
    type: "text",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
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
];

/**
 * Component chính chứa nội dung chat
 * @param {Function} setShowDetails - Hàm để toggle hiển thị panel chi tiết
 */
function ChatContainer({ setShowDetails }) {
  return (
    <div className="flex-1 flex flex-col relative h-full">
      {/* Header chứa thông tin người chat và các nút action */}
      <MessageHeader setShowDetails={setShowDetails} />
      
      {/* Khu vực hiển thị tin nhắn - có scroll khi overflow */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((message, index) => {
          // Lấy tin nhắn trước và sau để xác định vị trí trong nhóm
          const prevMessage = messages[index - 1];
          const nextMessage = messages[index + 1];
          
          // Xác định vị trí tin nhắn trong nhóm (để style border radius)
          const isFirstInGroup = !prevMessage || prevMessage.sender !== message.sender;
          const isLastInGroup = !nextMessage || nextMessage.sender !== message.sender;
          const isGrouped = !isFirstInGroup && !isLastInGroup; // Tin nhắn ở giữa nhóm
          
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isFirst={isFirstInGroup}  // Tin nhắn đầu nhóm
              isLast={isLastInGroup}    // Tin nhắn cuối nhóm (hiển thị avatar và timestamp)
              isGrouped={isGrouped}     // Tin nhắn ở giữa nhóm
            />
          );
        })}
      </div>

      {/* Input để nhập tin nhắn mới */}
      <InputMessage />
    </div>
  );
}

export default ChatContainer;
