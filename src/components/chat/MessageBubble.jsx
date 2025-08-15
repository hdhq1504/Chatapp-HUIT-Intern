import React, { useState } from 'react';
import ImagePreviewModal from '../common/ImagePreviewModal.jsx';
import { File, Image, Video, FileText, Download, Play } from 'lucide-react';
import { formatMessageTimestamp } from '../../utils/messageUtils.jsx';

function MessageBubble({
  message,
  isFirst,
  isLast,
  isGrouped,
  isNewSession = false,
  timeSeparator = null,
}) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const isSelf = message.sender === 'self';

  const isLongMessage = message.type === 'text' && message.content?.length > 50;
  const isLongTextWithFiles =
    message.type === 'files' && message.text?.length > 50;

  const getFileIcon = (type, size = 20) => {
    const iconProps = { size, className: 'flex-shrink-0' };
    switch (type) {
      case 'image':
        return <Image {...iconProps} className='text-blue-500' />;
      case 'video':
        return <Video {...iconProps} className='text-purple-500' />;
      case 'audio':
        return <Play {...iconProps} className='text-green-500' />;
      case 'pdf':
        return <FileText {...iconProps} className='text-red-500' />;
      case 'document':
        return <FileText {...iconProps} className='text-blue-600' />;
      case 'spreadsheet':
        return <FileText {...iconProps} className='text-green-600' />;
      default:
        return <File {...iconProps} className='text-gray-500' />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const handleFileDownload = async (file) => {
    try {
      let blob;
      let filename = file.name || 'download';

      if (file.file instanceof File) {
        blob = file.file;
        filename = file.file.name;
      } else if (file.url) {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error('Download failed');
        blob = await response.blob();
      } else {
        throw new Error('No valid file source');
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Không thể tải xuống file. Vui lòng thử lại.');
    }
  };

  const renderImageGrid = (images) => {
    if (images.length === 1) {
      const image = images[0];
      return (
        <div
          className='max-w-xs cursor-pointer overflow-hidden rounded-lg md:max-w-md'
          onClick={() => handleImageClick(image.url || image.preview)}
        >
          <img
            src={image.url || image.preview}
            alt={image.name}
            className='h-full w-full object-cover'
          />
        </div>
      );
    }

    const gridCols = images.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

    return (
      <div className={`grid max-w-xs gap-1 md:max-w-md ${gridCols}`}>
        {images.map((image, index) => (
          <div
            key={index}
            className='relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800'
            onClick={() => handleImageClick(image.url || image.preview)}
          >
            <img
              src={image.url || image.preview}
              alt={image.name}
              className='h-full w-full object-cover'
            />
          </div>
        ))}
      </div>
    );
  };

  const renderTimeSeparator = () => {
    if (!timeSeparator) return null;

    return (
      <div className='relative my-2 flex items-center justify-center'>
        <div className='flex-grow border-t border-neutral-400 dark:border-neutral-600'></div>
        <div className='mx-4'>
          <span className='text-xs font-medium text-neutral-600 dark:text-neutral-400'>
            {timeSeparator}
          </span>
        </div>
        <div className='flex-grow border-t border-neutral-400 dark:border-neutral-600'></div>
      </div>
    );
  };

  const renderMessageContent = () => {
    if (message.type === 'text') {
      return (
        <div
          className={`break-words ${isSelf
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-black dark:bg-[#212121] dark:text-white'
            } ${isLongMessage ? 'rounded-2xl px-4 py-3' : 'rounded-full px-3 py-2'
            }`}
        >
          <p
            className={`text-[15px] ${isLongMessage ? 'leading-relaxed' : 'leading-snug'}`}
          >
            {message.content}
          </p>
        </div>
      );
    }

    if (message.type === 'image') {
      return (
        <div
          className='max-w-sm cursor-pointer overflow-hidden rounded-lg md:max-w-md'
          onClick={() => handleImageClick(message.content)}
        >
          <img
            src={message.content}
            alt='Shared image'
            className='h-full w-full object-cover'
          />
        </div>
      );
    }

    if (message.type === 'files' && message.files?.length > 0) {
      const images = message.files.filter((file) => file.fileType === 'image');
      const videos = message.files.filter((file) => file.fileType === 'video');
      const otherFiles = message.files.filter(
        (file) => file.fileType !== 'image' && file.fileType !== 'video',
      );

      return (
        <div
          className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
        >
          {message.text?.trim() && (
            <div
              className={`mb-2 break-words ${isSelf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 dark:bg-[#212121] dark:text-white'
                } ${isLongTextWithFiles
                  ? 'rounded-2xl px-4 py-3'
                  : 'rounded-full px-3 py-2'
                }`}
            >
              <p
                className={`text-[15px] ${isLongTextWithFiles ? 'leading-relaxed' : 'leading-snug'}`}
              >
                {message.text}
              </p>
            </div>
          )}

          <div
            className={`flex flex-col gap-2 ${isSelf ? 'items-end' : 'items-start'}`}
          >
            {/* Images */}
            {images.length > 0 && renderImageGrid(images)}

            {/* Videos */}
            {videos.map((file, index) => (
              <div
                key={`video-${index}`}
                className='max-w-xs overflow-hidden rounded-lg md:max-w-md'
              >
                <video
                  src={file.url || file.preview}
                  className='h-full w-full object-cover'
                  controls
                  preload='metadata'
                />
              </div>
            ))}

            {/* Other files */}
            {otherFiles.map((file, index) => (
              <div
                key={`file-${index}`}
                className='flex w-full max-w-xs cursor-pointer items-center space-x-3 rounded-lg bg-[#F3F3F3] p-4 hover:bg-gray-100 md:max-w-sm dark:bg-[#404040] hover:dark:bg-[#353535]'
                onClick={() => handleFileDownload(file)}
              >
                <div className='flex-shrink-0'>
                  {getFileIcon(file.fileType, 26)}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                    {file.name}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {formatFileSize(file.size)} • {file.fileType}
                  </p>
                </div>
                <Download
                  size={16}
                  className='flex-shrink-0 text-gray-500 hover:text-blue-500'
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {timeSeparator && renderTimeSeparator()}

      <div
        className={`flex ${isSelf ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : isNewSession ? 'mt-6' : 'mt-3'
          }`}
      >
        <div
          className={`flex max-w-[85%] flex-col md:max-w-[45%] ${isSelf ? 'items-end' : 'items-start'}`}
        >
          <div className='flex items-end gap-2'>
            {!isSelf && (
              <div className='flex-shrink-0'>
                {isLast ? (
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500 md:h-8 md:w-8'>
                    <span className='text-xs font-semibold text-white md:text-sm'>
                      M
                    </span>
                  </div>
                ) : (
                  <div className='h-6 w-6 md:h-8 md:w-8' />
                )}
              </div>
            )}

            <div className='min-w-0 flex-1'>{renderMessageContent()}</div>
          </div>

          {isLast && (
            <span
              className={`mt-1 block text-[11px] text-gray-600 dark:text-neutral-400 ${isSelf ? 'pr-1' : 'pl-8 md:pl-10'
                }`}
            >
              {formatMessageTimestamp(message.timestamp)}
            </span>
          )}
        </div>
      </div>

      <ImagePreviewModal
        imageUrl={selectedImageUrl}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        altText='Shared image'
      />
    </>
  );
}

export default MessageBubble;
