import React, { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal.jsx";

/**
 * Component hiển thị từng tin nhắn trong chat
 * @param {Object} message - Dữ liệu tin nhắn {id, type, content, timestamp, sender}
 * @param {boolean} isFirst - Tin nhắn đầu tiên trong nhóm cùng sender
 * @param {boolean} isLast - Tin nhắn cuối cùng trong nhóm (hiển thị avatar + timestamp)
 * @param {boolean} isGrouped - Tin nhắn ở giữa nhóm
 * @param {boolean} isMobile - Kiểm tra có phải mobile không
 * @param {boolean} isTablet - Kiểm tra có phải tablet không
 */
function MessageBubble({ message, isFirst, isLast, isGrouped, isMobile, isTablet }) {
  // State để điều khiển modal xem ảnh
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Kiểm tra tin nhắn của mình hay người khác
  const isSelf = message.sender === "self";
  
  // Kiểm tra tin nhắn dài để áp dụng style khác
  const isLongMessage = message.type === "text" && message.content.length > 50;
  
  // Class điều chỉnh độ rộng tối đa dựa trên kích thước màn hình và độ dài tin nhắn
  const getMaxWidthClass = () => {
    if (isMobile) {
      return isLongMessage ? "max-w-[85%]" : "max-w-[75%]";
    } else if (isTablet) {
      return isLongMessage ? "max-w-[70%]" : "max-w-[60%]";
    } else {
      return isLongMessage ? "max-w-[60%]" : "max-w-[45%]";
    }
  };

  // Xử lý click vào ảnh
  const handleImageClick = () => {
    if (message.type === "image") {
      setShowImageModal(true);
    }
  };

  // Avatar size dựa trên kích thước màn hình
  const avatarSize = isMobile ? "w-8 h-8" : "w-10 h-10";
  const avatarTextSize = isMobile ? "text-xs" : "text-sm";

  return (
    <>
      {/* Container chính với alignment dựa trên sender */}
      <div
        className={`flex ${isSelf ? "justify-end" : "justify-start"} ${
          isFirst ? (isMobile ? "mt-3" : "mt-4") : "mt-0.5"
        }`}
      >
        {/* Wrapper cho tin nhắn với max-width responsive */}
        <div className={`flex flex-col gap-0.5 ${getMaxWidthClass()}`} 
             style={{ alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
          
          {/* Container cho avatar và tin nhắn */}
          <div className="flex flex-row gap-2 items-end w-full">
            
            {/* Avatar - chỉ hiển thị cho tin nhắn không phải của mình */}
            {!isSelf && (
              <div className="flex-shrink-0">
                {isLast ? (
                  // Avatar thật chỉ hiển thị ở tin nhắn cuối nhóm
                  <div className={`${avatarSize} rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center shadow-md`}>
                    <span className={`${avatarTextSize} font-semibold text-white`}>M</span>
                  </div>
                ) : (
                  // Placeholder để giữ khoảng cách cho các tin nhắn khác trong nhóm
                  <div className={avatarSize} />
                )}
              </div>
            )}
            
            {/* Container tin nhắn */}
            <div className="flex min-w-0 flex-1">
              {message.type === "image" ? (
                <div className="rounded-2xl overflow-hidden shadow-lg cursor-pointer" onClick={handleImageClick}>
                  <img 
                    src={message.content} 
                    alt="Shared image" 
                    className={`
                      object-cover rounded-2xl
                      ${isMobile 
                        ? 'max-w-[300px] max-h-[355px]' 
                        : isTablet 
                          ? 'max-w-[450px] max-h-[380px]'
                          : 'max-w-md h-auto'
                      }
                    `}
                  />
                </div>
              ) : (
                <div
                  className={`
                    rounded-2xl break-words shadow-sm transition-all duration-200 
                    ${isMobile ? 'px-3 py-2' : 'px-4 py-2.5'}
                    ${
                      isSelf
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-[#212121] text-gray-900 dark:text-white rounded-bl-md"
                    }
                    ${isGrouped ? (isSelf ? "rounded-tr-md" : "rounded-tl-md") : ""}
                    ${isLongMessage ? "leading-relaxed" : "leading-normal"}
                  `}
                >
                  <p className={`text-sm ${isLongMessage ? "text-justify" : ""}`}>
                    {message.content}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Timestamp */}
          {isLast && (
            <p className={`
              text-xs text-gray-500 dark:text-gray-400 mt-1 
              ${isMobile ? 'ml-8' : 'ml-12'} 
              ${isSelf ? "text-right" : "text-left"}
            `} 
            style={{ width: '100%' }}>
              {message.timestamp}
            </p>
          )}
        </div>
      </div>

      {/* Modal xem ảnh */}
      {message.type === "image" && (
        <ImagePreviewModal
          imageUrl={message.content}
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          altText="Shared image in chat"
        />
      )}
    </>
  );
}

export default MessageBubble;
