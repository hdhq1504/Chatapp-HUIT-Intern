import React, { useState, useRef, useEffect } from "react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import { Image, Mic, Smile, Send } from "lucide-react";

/**
 * Component input để nhập và gửi tin nhắn
 * Bao gồm: textarea tự động resize, các nút attachment, emoji, voice, send
 */
function InputMessage() {
  // State lưu nội dung tin nhắn đang nhập
  const [message, setMessage] = useState("");
  
  // Ref để truy cập DOM element của textarea
  const textareaRef = useRef(null);

  /**
   * Effect tự động điều chỉnh chiều cao textarea theo nội dung
   * Chạy mỗi khi message thay đổi
   */
  useEffect(() => {
    if (textareaRef.current) {
      // Reset về chiều cao tự động
      textareaRef.current.style.height = 'auto';
      // Set chiều cao bằng scrollHeight (chiều cao nội dung thực tế)
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  /**
   * Xử lý sự kiện nhấn phím
   * Enter (không Shift): gửi tin nhắn
   * Shift + Enter: xuống dòng
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Ngăn xuống dòng mặc định
      handleSendMessage();
    }
  };

  /**
   * Xử lý gửi tin nhắn
   * Chỉ gửi khi có nội dung (không chỉ khoảng trắng)
   */
  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      // Có thể thay bằng API call để gửi tin nhắn
      setMessage(""); // Xóa nội dung sau khi gửi
    }
  };

  return (
    <>
      {/* Container cố định ở bottom với shadow */}
      <div className="p-4 pb-2.5 bg-[#F9F9F9] dark:bg-[#212121] shadow-sm sticky bottom-0 z-10">
        <div className="flex items-end space-x-3">
          
          {/* Nút đính kèm ảnh */}
          <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer mb-2">
            <Image size={20} />
          </button>
          
          {/* Nút emoji */}
          <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer mb-2">
            <Smile size={20} />
          </button>
          
          {/* Nút ghi âm */}
          <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer mb-2">
            <Mic size={20} />
          </button>

          {/* Container textarea - chiếm không gian còn lại */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className={`w-full bg-gray-200 dark:bg-[#303030] rounded-lg px-4 py-2 pr-10 focus:outline-none resize-none overflow-y-auto ${customScrollbarStyles} max-h-32`}
              rows={1} // Bắt đầu với 1 dòng
            />
          </div>

          {/* Nút gửi tin nhắn */}
          <button 
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg font-semibold text-white cursor-pointer mb-2"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
  );
}

export default InputMessage;
