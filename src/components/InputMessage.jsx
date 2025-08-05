import React, { useState, useRef, useEffect } from "react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import { Mic, Smile, Send, Paperclip, MoreHorizontal } from "lucide-react";
import { EmojiPicker } from "frimousse";
import { useClickOutsideWithException } from "../hooks/useClickOutside.jsx";

/**
 * Component input để nhập và gửi tin nhắn
 * Bao gồm: textarea tự động resize, các nút attachment, emoji, voice, send
 * @param {boolean} isMobile - Kiểm tra có phải mobile không
 * @param {boolean} isTablet - Kiểm tra có phải tablet không
 */
function InputMessage({ isMobile, isTablet }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const textareaRef = useRef(null);

  // Sử dụng useClickOutsideWithException để đóng emoji picker
  const emojiPickerRef = useClickOutsideWithException(
    () => setShowEmojiPicker(false),
    showEmojiPicker,
    '[data-emoji-trigger]'
  );

  /**
   * Effect tự động điều chỉnh chiều cao textarea theo nội dung
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = isMobile ? 120 : 128; // max-h-30 cho mobile, max-h-32 cho desktop
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = scrollHeight + 'px';
    }
  }, [message, isMobile]);

  /**
   * Xử lý sự kiện nhấn phím
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Xử lý gửi tin nhắn
   */
  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  /**
   * Xử lý toggle emoji picker
   */
  const handleEmojiToggle = () => {
    setShowEmojiPicker(prev => !prev);
  };

  /**
   * Xử lý chọn emoji
   */
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-4 pb-2.5 bg-[#F9F9F9] dark:bg-[#212121] shadow-sm sticky bottom-0 z-10">
      <div className="flex items-end space-x-3">
        {/* Input đính kèm ảnh */}
        <div className="relative">
          <input
            type="file"
            accept="*"
            className="hidden"
            id="image-upload"
            onChange={(e) => console.log('Image:', e.target.files[0])}
          />
          <label
            htmlFor="image-upload"
            className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer mb-2 inline-flex"
          >
            <Paperclip size={20} />
          </label>
        </div>

        {/* Nút emoji với click outside handling */}
        <div className="relative">
          <button 
            className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer mb-2"
            onClick={handleEmojiToggle}
            data-emoji-trigger // Attribute để loại trừ trong click outside
          >
            <Smile size={20} />
          </button>
          
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2">
              <EmojiPicker.Root className="isolate flex h-[368px] w-fit flex-col bg-white dark:bg-[#181818] rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700">
                <EmojiPicker.Search 
                  className="z-10 mx-2 mt-2 appearance-none rounded-md focus:outline-none bg-neutral-100 px-2.5 py-2 text-sm dark:bg-neutral-800" 
                  placeholder="Search emoji..."
                />
                <EmojiPicker.Viewport className={`relative flex-1 outline-hidden ${customScrollbarStyles}`}>
                  <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                    Loading…
                  </EmojiPicker.Loading>
                  <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                    No emoji found.
                  </EmojiPicker.Empty>
                  <EmojiPicker.List
                    className="select-none pb-1.5"
                    components={{
                      CategoryHeader: ({ category, ...props }) => (
                        <div
                          className="bg-white px-3 pt-3 pb-1.5 font-medium text-neutral-600 text-xs dark:bg-[#181818] dark:text-neutral-400"
                          {...props}
                        >
                          {category.label}
                        </div>
                      ),
                      Row: ({ children, ...props }) => (
                        <div className="scroll-my-1.5 px-1.5" {...props}>
                          {children}
                        </div>
                      ),
                      Emoji: ({ emoji, ...props }) => (
                        <button
                          className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-neutral-100 dark:data-[active]:bg-neutral-800 cursor-pointer"
                          onClick={() => handleEmojiSelect(emoji)}
                          {...props}
                        >
                          {emoji.emoji}
                        </button>
                      ),
                    }}
                  />
                </EmojiPicker.Viewport>
              </EmojiPicker.Root>
            </div>
          )}
        </div>

        {/* Nút ghi âm */}
        <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer mb-2">
          <Mic size={20} />
        </button>

        {/* Container textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            className={`w-full bg-gray-200 dark:bg-[#303030] rounded-xl px-4 py-2 pr-10 focus:outline-none resize-none overflow-y-auto ${customScrollbarStyles} max-h-32`}
            rows={1}
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
  );
}

export default InputMessage;
