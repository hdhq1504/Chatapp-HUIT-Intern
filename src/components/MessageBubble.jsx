import React from "react";

/**
 * Component hiển thị từng tin nhắn trong chat
 * @param {Object} message - Dữ liệu tin nhắn {id, type, content, timestamp, sender}
 * @param {boolean} isFirst - Tin nhắn đầu tiên trong nhóm cùng sender
 * @param {boolean} isLast - Tin nhắn cuối cùng trong nhóm (hiển thị avatar + timestamp)
 * @param {boolean} isGrouped - Tin nhắn ở giữa nhóm
 */
function MessageBubble({ message, isFirst, isLast, isGrouped }) {
  // Kiểm tra tin nhắn của mình hay người khác
  const isSelf = message.sender === "self";
  
  // Kiểm tra tin nhắn dài để áp dụng style khác
  const isLongMessage = message.type === "text" && message.content.length > 30;
  
  // Class điều chỉnh độ rộng tối đa dựa trên độ dài tin nhắn
  const maxWidthClass = isLongMessage ? "lg:max-w-[50%] md:max-w-[90%]" : "max-w-[85%]";

  return (
    // Container chính với alignment dựa trên sender
    <div
      className={`flex ${isSelf ? "justify-end" : "justify-start"} ${isFirst ? "mt-4" : "mt-1"}`}
    >
      {/* Wrapper cho tin nhắn với max-width responsive */}
      <div className={`flex flex-col gap-0.5 ${maxWidthClass}`} style={{ alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
        
        {/* Container cho avatar và tin nhắn */}
        <div className="flex flex-row gap-2 items-end w-full">
          
          {/* Avatar - chỉ hiển thị cho tin nhắn không phải của mình */}
          {!isSelf && (
            <div className="flex-shrink-0">
              {isLast ? (
                // Avatar thật chỉ hiển thị ở tin nhắn cuối nhóm
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center shadow-md">
                  <span className="text-xs font-semibold text-white">M</span>
                </div>
              ) : (
                // Placeholder để giữ khoảng cách cho các tin nhắn khác trong nhóm
                <div className="w-8 h-8" />
              )}
            </div>
          )}
          
          {/* Container tin nhắn */}
          <div className="flex min-w-0 flex-1">
            {message.type === "image" ? (
              // Hiển thị ảnh với border radius và shadow
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img src={message.content} alt="Shared image" className="max-w-md h-auto object-cover" />
              </div>
            ) : (
              // Hiển thị tin nhắn text với bubble style
              <div
                className={`px-4 py-2.5 rounded-2xl break-words shadow-sm transition-all duration-200 
                  ${
                    isSelf
                      ? "bg-blue-500 text-white rounded-br-md" // Tin nhắn của mình: xanh, góc phải vuông
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md" // Tin nhắn người khác: xám, góc trái vuông
                  }
                  ${isGrouped ? (isSelf ? "rounded-tr-md" : "rounded-tl-md") : ""} // Góc trên vuông nếu là tin nhắn giữa nhóm
                  ${isLongMessage ? "leading-relaxed" : "leading-normal"}`} // Line height dựa trên độ dài
              >
                <p className={`text-sm ${isLongMessage ? "text-justify" : ""}`}>
                  {message.content}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Timestamp - chỉ hiển thị ở tin nhắn cuối nhóm */}
        {isLast && (
          <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ml-10 ${isSelf ? "text-right" : "text-left"}`} style={{ width: '100%' }}>
            {message.timestamp}
          </p>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
