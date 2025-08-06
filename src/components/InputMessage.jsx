import React, { useState, useRef, useEffect } from "react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import { Mic, Smile, Send, Paperclip, X, File, Image, Video, FileText } from "lucide-react";
import { EmojiPicker } from "frimousse";
import { useClickOutsideWithException } from "../hooks/useClickOutside.jsx";

function InputMessage({ onSendMessage, onSendFile, disabled = false }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  
  const textareaRef = useRef(null);

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.includes('document') || file.type.includes('word')) return 'document';
    if (file.type.includes('sheet') || file.type.includes('excel')) return 'spreadsheet';
    return 'file';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image size={18} className="text-blue-500" />;
      case 'video': return <Video size={18} className="text-purple-500" />;
      case 'audio': return <File size={18} className="text-green-500" />;
      case 'pdf': return <FileText size={18} className="text-red-500" />;
      case 'document': return <FileText size={18} className="text-blue-600" />;
      case 'spreadsheet': return <FileText size={18} className="text-green-600" />;
      default: return <File size={18} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const emojiPickerRef = useClickOutsideWithException(
    () => setShowEmojiPicker(false),
    showEmojiPicker,
    '[data-emoji-trigger]'
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const isMobile = window.innerWidth < 768;
      const maxHeight = isMobile ? 120 : 128;
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = scrollHeight + 'px';
    }
  }, [message]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (previewFiles.length > 0 && !disabled) {
      if (onSendFile) {
        onSendFile(previewFiles, message.trim());
      }
      clearPreview();
      setMessage("");
      return;
    }

    if (message.trim() && !disabled) {
      if (onSendMessage) {
        onSendMessage(message.trim());
      }
      setMessage("");
    }
  };

  const clearPreview = () => {
    previewFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setPreviewFiles([]);
  };

  const removePreviewFile = (indexToRemove) => {
    const fileToRemove = previewFiles[indexToRemove];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setPreviewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleEmojiToggle = () => {
    if (!disabled) {
      setShowEmojiPicker(prev => !prev);
    }
  };

  const handleEmojiSelect = (emoji) => {
    if (!disabled) {
      setMessage(prev => prev + emoji.emoji);
      setShowEmojiPicker(false);
    }
  };

  const handleFileUpload = (e) => {
    if (!disabled) {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        const processedFiles = files.map(file => {
          const fileType = getFileType(file);
          const processedFile = {
            ...file,
            id: Date.now() + Math.random(),
            fileType,
          };

          if (fileType === 'image' || fileType === 'video') {
            processedFile.preview = URL.createObjectURL(file);
          }
          
          return processedFile;
        });
        
        setPreviewFiles(prev => [...prev, ...processedFiles]);
        
        e.target.value = '';
      }
    }
  };

  return (
    <div className="p-3 md:p-4 pb-2 md:pb-2.5 bg-[#F9F9F9] dark:bg-[#212121] shadow-sm sticky bottom-0 z-10">
      {previewFiles.length > 0 && (
        <div className="mb-3 p-3 bg-white dark:bg-[#303030] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Files ({previewFiles.length})
            </span>
            <button
              onClick={clearPreview}
              className="p-1 hover:bg-gray-100 dark:hover:bg-[#3F3F3F] rounded-lg"
              title="Remove all files"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className={`space-y-2 max-h-40 overflow-y-auto ${customScrollbarStyles}`}>
            {previewFiles.map((file, index) => (
              <div key={file.id} className="flex items-center space-x-3 p-2 mr-1 bg-gray-50 dark:bg-[#404040] rounded">
                <div className="flex-shrink-0">
                  {file.fileType === 'image' && file.preview ? (
                    <img
                      src={file.preview}
                      alt="Preview"
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : file.fileType === 'video' && file.preview ? (
                    <video
                      src={file.preview}
                      className="w-10 h-10 rounded object-cover"
                      muted
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
                      {getFileIcon(file.fileType)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)} • {file.fileType}
                  </p>
                </div>
                
                <button
                  onClick={() => removePreviewFile(index)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end space-x-2 md:space-x-3">
        <div className="relative">
          <input
            type="file"
            accept="*"
            className="hidden"
            id="file-upload"
            onChange={handleFileUpload}
            disabled={disabled}
            multiple
          />
          <label
            htmlFor="file-upload"
            className={`p-1.5 md:p-2 rounded-lg mb-2 inline-flex ${
              disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#EFEFEF] dark:hover:bg-[#303030] cursor-pointer'
            }`}
            title="Attach files"
          >
            <Paperclip size={18} className="md:w-5 md:h-5" />
          </label>
        </div>

        <div className="relative">
          <button 
            className={`p-1.5 md:p-2 rounded-lg mb-2 ${
              disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#EFEFEF] dark:hover:bg-[#303030] cursor-pointer'
            }`}
            onClick={handleEmojiToggle}
            data-emoji-trigger
            disabled={disabled}
          >
            <Smile size={18} className="md:w-5 md:h-5" />
          </button>
          
          {showEmojiPicker && !disabled && (
            <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2">
              <EmojiPicker.Root className="isolate flex h-[300px] md:h-[368px] w-fit flex-col bg-white dark:bg-[#181818] rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700">
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

        <button 
          className={`p-1.5 md:p-2 rounded-lg mb-2 ${
            disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-[#EFEFEF] dark:hover:bg-[#303030] cursor-pointer'
          }`}
          disabled={disabled}
        >
          <Mic size={18} className="md:w-5 md:h-5" />
        </button>

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={"Type a message..."}
            disabled={disabled}
            className={`w-full bg-gray-200 dark:bg-[#303030] rounded-xl px-3 md:px-4 py-1.5 md:py-2 pr-8 md:pr-10 focus:outline-none resize-none overflow-y-auto ${customScrollbarStyles} text-sm md:text-base max-h-[120px] md:max-h-32 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            rows={1}
          />
        </div>

        <button
          onClick={handleSendMessage}
          disabled={disabled || (!message.trim() && previewFiles.length === 0)}
          className={`px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg font-semibold text-white mb-2 ${
            disabled || (!message.trim() && previewFiles.length === 0)
              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          }`}
          title={previewFiles.length > 0 ? 'Send files' : 'Send message'}
        >
          <Send size={18} className="md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
}

export default InputMessage;
