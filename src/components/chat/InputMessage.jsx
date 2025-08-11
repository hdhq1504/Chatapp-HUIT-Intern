import React, { useState, useRef, useEffect } from 'react';
import { customScrollbarStyles } from '../../utils/styles.jsx';
import { Send, Paperclip, X, File, Image, Video, FileText } from 'lucide-react';

function InputMessage({ onSendMessage, onSendFile, disabled = false }) {
  const [message, setMessage] = useState('');
  const [previewFiles, setPreviewFiles] = useState([]);

  const textareaRef = useRef(null);
  const filePreviewRef = useRef(null);

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
        return <Image size={20} className='text-blue-500' />;
      case 'video':
        return <Video size={20} className='text-purple-500' />;
      case 'audio':
        return <File size={20} className='text-green-500' />;
      case 'pdf':
        return <FileText size={20} className='text-red-500' />;
      case 'document':
        return <FileText size={20} className='text-blue-600' />;
      case 'spreadsheet':
        return <FileText size={20} className='text-green-600' />;
      case 'presentation':
        return <FileText size={20} className='text-orange-500' />;
      default:
        return <File size={20} className='text-gray-500' />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
              <div className='p-3 pb-2'>
                <div
                  ref={filePreviewRef}
                  className={`flex max-h-40 flex-wrap gap-2 overflow-y-auto pb-1 ${customScrollbarStyles}`}
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {previewFiles.map((file, index) => (
                    <div key={file.id} className='group relative flex-shrink-0'>
                      {file.fileType === 'image' ||
                      file.fileType === 'video' ? (
                        <div className='relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100 shadow-sm dark:bg-[#404040]'>
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
                          ) : null}

                          {/* Remove button */}
                          <button
                            onClick={() => removePreviewFile(index)}
                            className='absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white text-[#181818] shadow-md transition-all'
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className='relative flex h-20 w-64 max-w-full items-center rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-[#404040]'>
                          <div className='mr-3 flex-shrink-0'>
                            {getFileIcon(file.fileType)}
                          </div>
                          <div className='flex flex-1 flex-col justify-center overflow-hidden'>
                            <span className='mb-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200'>
                              {file.name}
                            </span>
                            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                              <span className='font-medium uppercase'>
                                {formatFileSize(file.size)} •{' '}
                                {file.name.split('.').pop()}
                              </span>
                            </div>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removePreviewFile(index)}
                            className='absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white text-[#181818] shadow-md transition-all'
                            title='Remove file'
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
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
              placeholder={'Type a message...'}
              disabled={disabled}
              className={`w-full resize-none overflow-y-auto bg-transparent px-3 py-1.5 pr-8 focus:outline-none md:px-4 md:py-2 md:pr-10 ${customScrollbarStyles} text-md md:text-md max-h-[120px] md:max-h-32 ${
                disabled ? 'cursor-not-allowed opacity-50' : ''
              } text-gray-800 placeholder-gray-500 dark:text-gray-200 dark:placeholder-gray-400`}
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
