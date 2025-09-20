import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { scrollBar } from '../storage/helpers';

function InputMessage({ onSendMessage, disabled = false }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = window.innerWidth < 768 ? 120 : 128;
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = scrollHeight + 'px';
    }
  }, [message]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !disabled) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (disabled) {
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    if (onSendMessage) {
      onSendMessage(trimmed);
    }
    setMessage('');
  };

  return (
    <div className='sticky bottom-0 z-10 bg-[#F9F9F9] p-3 shadow-sm dark:bg-[#212121]'>
      <div className='flex items-end gap-2'>
        <div className='flex-1'>
          <div className='rounded-xl bg-gray-200 dark:bg-[#303030]'>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Type a message...'
              disabled={disabled}
              className={`w-full resize-none overflow-y-auto bg-transparent px-3 py-1.5 pr-8 focus:outline-none md:px-4 md:py-2 md:pr-10 ${scrollBar} text-md md:text-md max-h-[120px] md:max-h-32 ${
                disabled ? 'cursor-not-allowed opacity-50' : ''
              } text-gray-800 placeholder-gray-500 dark:text-gray-200 dark:placeholder-gray-400`}
              rows={1}
            />
          </div>
        </div>

        <div className='flex-shrink-0 pb-1'>
          <button
            onClick={handleSendMessage}
            disabled={disabled || !message.trim()}
            className={`flex h-10 w-full items-center justify-center rounded-lg p-2 transition-colors ${
              disabled || !message.trim()
                ? 'cursor-not-allowed bg-gray-400 opacity-50'
                : 'cursor-pointer bg-blue-600 hover:bg-blue-700'
            } `}
          >
            <Send size={20} className='mr-1 text-white' />
            <span className='hidden text-white md:block'>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputMessage;
