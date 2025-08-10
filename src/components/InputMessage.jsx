import React, { useState, useRef, useEffect } from 'react';
import { customScrollbarStyles } from '../utils/styles.jsx';
import { Send, Paperclip, X, File, Image, Video, FileText } from 'lucide-react';

function InputMessage({ onSendMessage, onSendFile, disabled = false }) {
  const [message, setMessage] = useState('');
  const [previewFiles, setPreviewFiles] = useState([]);

  const textareaRef = useRef(null);

  const getFileType = (file) => {
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop();

    // Image files
    if (
      [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'bmp',
        'webp',
        'svg',
        'ico',
        'tiff',
        'tif',
      ].includes(extension)
    ) {
      return 'image';
    }

    // Video files
    if (
      [
        'mp4',
        'avi',
        'mov',
        'wmv',
        'flv',
        'webm',
        'mkv',
        'm4v',
        '3gp',
        'ogv',
      ].includes(extension)
    ) {
      return 'video';
    }

    // Audio files
    if (
      [
        'mp3',
        'wav',
        'flac',
        'aac',
        'ogg',
        'wma',
        'm4a',
        'opus',
        'aiff',
      ].includes(extension)
    ) {
      return 'audio';
    }

    // PDF files
    if (extension === 'pdf') {
      return 'pdf';
    }

    // Document files
    if (
      ['doc', 'docx', 'odt', 'rtf', 'tex', 'txt', 'wpd'].includes(extension)
    ) {
      return 'document';
    }

    // Spreadsheet files
    if (['xls', 'xlsx', 'ods', 'csv', 'tsv'].includes(extension)) {
      return 'spreadsheet';
    }

    // Presentation files
    if (['ppt', 'pptx', 'odp'].includes(extension)) {
      return 'presentation';
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image size={24} className='text-blue-500' />;
      case 'video':
        return <Video size={24} className='text-purple-500' />;
      case 'audio':
        return <File size={24} className='text-green-500' />;
      case 'pdf':
        return <FileText size={24} className='text-red-500' />;
      case 'document':
        return <FileText size={24} className='text-blue-600' />;
      case 'spreadsheet':
        return <FileText size={24} className='text-green-600' />;
      case 'presentation':
        return <FileText size={24} className='text-orange-500' />;
      default:
        return <File size={24} className='text-gray-500' />;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const isMobile = window.innerWidth < 768;
      const maxHeight = isMobile ? 120 : 128;
      const scrollHeight = Math.min(
        textareaRef.current.scrollHeight,
        maxHeight,
      );
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
      setMessage('');
      return;
    }

    if (message.trim() && !disabled) {
      if (onSendMessage) {
        onSendMessage(message.trim());
      }
      setMessage('');
    }
  };

  const clearPreview = () => {
    previewFiles.forEach((file) => {
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setPreviewFiles([]);
  };

  const removePreviewFile = (indexToRemove) => {
    const fileToRemove = previewFiles[indexToRemove];
    if (fileToRemove.preview && fileToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setPreviewFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleFileUpload = (e) => {
    if (!disabled) {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        const processedFiles = files.map((file) => {
          const fileType = getFileType(file);
          const processedFile = {
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            id: Date.now() + Math.random(),
            fileType,
          };

          if (fileType === 'image' || fileType === 'video') {
            processedFile.preview = URL.createObjectURL(file);
          }

          return processedFile;
        });

        setPreviewFiles((prev) => [...prev, ...processedFiles]);
        e.target.value = '';
      }
    }
  };

  return (
    <div className='sticky bottom-0 z-10 bg-[#F9F9F9] p-3 shadow-sm dark:bg-[#212121]'>
      <div className='flex items-end gap-2'>
        {/* File Upload Button */}
        <div className='flex-shrink-0 pb-1'>
          <input
            type='file'
            accept='*/*'
            className='hidden'
            id='file-upload'
            onChange={handleFileUpload}
            disabled={disabled}
            multiple
          />
          <label
            htmlFor='file-upload'
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer hover:bg-gray-300 dark:hover:bg-[#303030]'
            }`}
            title='Attach files'
          >
            <Paperclip size={20} className='text-gray-600 dark:text-gray-100' />
          </label>
        </div>

        {/* Message Input Area */}
        <div className='flex-1'>
          <div className='rounded-xl bg-gray-200 dark:bg-[#303030]'>
            {/* Files Preview */}
            {previewFiles.length > 0 && (
              <div className='p-3 pb-0'>
                <div className='scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent flex space-x-2 overflow-x-auto pb-2'>
                  {previewFiles.map((file, index) => (
                    <div key={file.id} className='group relative flex-shrink-0'>
                      <div className='relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100 dark:bg-[#404040]'>
                        {file.fileType === 'image' && file.preview ? (
                          <img
                            src={file.preview}
                            alt='Preview'
                            className='h-full w-full object-cover'
                          />
                        ) : file.fileType === 'video' && file.preview ? (
                          <video
                            src={file.preview}
                            className='h-full w-full object-cover'
                            muted
                          />
                        ) : (
                          <div className='flex h-full flex-col items-center justify-center p-1'>
                            {getFileIcon(file.fileType)}
                            <span className='mt-1 w-full truncate text-center text-[12px] text-gray-500 dark:text-gray-400'>
                              {file.name.length > 8
                                ? file.name.substring(0, 6) + '...'
                                : file.name}
                            </span>
                          </div>
                        )}

                        {/* Remove button */}
                        <button
                          onClick={() => removePreviewFile(index)}
                          className='absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#EFEFEF] text-[#212121] opacity-0 transition-opacity group-hover:opacity-100'
                          title='Remove file'
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Type a message...'
              disabled={disabled}
              className={`w-full resize-none overflow-y-auto bg-transparent px-3 py-1.5 pr-8 focus:outline-none md:px-4 md:py-2 md:pr-10 ${customScrollbarStyles} text-md md:text-md max-h-[120px] md:max-h-32 ${
                disabled ? 'cursor-not-allowed opacity-50' : ''
              } ${previewFiles.length > 0 ? 'pt-0' : ''}`}
              rows={1}
            />
          </div>
        </div>

        {/* Send Button */}
        <div className='flex-shrink-0 pb-1'>
          <button
            onClick={handleSendMessage}
            disabled={
              disabled || (!message.trim() && previewFiles.length === 0)
            }
            className={`flex h-10 w-full items-center justify-center rounded-lg p-2 transition-colors ${
              disabled || (!message.trim() && previewFiles.length === 0)
                ? 'cursor-not-allowed bg-gray-400 opacity-50'
                : 'cursor-pointer bg-blue-600 hover:bg-blue-700'
            }`}
            title={previewFiles.length > 0 ? 'Send files' : 'Send message'}
          >
            <Send size={20} className='mr-1 text-white' />
            <span className='hidden md:block'>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputMessage;
