import React, { useState } from 'react';
import ImagePreviewModal from '../common/ImagePreviewModal.jsx';
import { File, Image, Video, FileText, Download, Play } from 'lucide-react';
import { formatMessageTimestamp } from '../../utils/messageUtils.jsx';

function MessageBubble({
  message,
  isFirst,
  isLast,
  isGrouped,
  showUnreadDivider = false,
  isNewSession = false,
  timeSeparator = null,
}) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const isSelf = message.sender === 'self';

  const isLongMessage =
    message.type === 'text' && message.content && message.content.length > 50;
  const isLongTextWithFiles =
    message.type === 'files' && message.text && message.text.length > 50;

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
      case 'presentation':
        return <FileText {...iconProps} className='text-orange-500' />;
      default:
        return <File {...iconProps} className='text-gray-500' />;
    }
  };

  const getFileTypeLabel = (type) => {
    switch (type) {
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      case 'pdf':
        return 'PDF';
      case 'document':
        return 'Document';
      case 'spreadsheet':
        return 'Spreadsheet';
      case 'presentation':
        return 'Presentation';
      default:
        return 'File';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const handleFileDownload = async (file) => {
    try {
      let blob;
      let filename = file.name || 'download';

      if (file.file && file.file instanceof File) {
        blob = file.file;
        filename = file.file.name;
      } else if (file.url) {
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        blob = await response.blob();
      } else if (file.data) {
        if (typeof file.data === 'string' && file.data.startsWith('data:')) {
          const response = await fetch(file.data);
          blob = await response.blob();
        } else if (file.data instanceof ArrayBuffer) {
          blob = new Blob([file.data]);
        } else {
          throw new Error('Unsupported file data format');
        }
      } else {
        throw new Error('No valid file source found');
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

      let errorMessage = 'Không thể tải xuống file. ';
      if (error.name === 'TypeError') {
        errorMessage += 'Vui lòng kiểm tra kết nối mạng.';
      } else if (error.message.includes('HTTP error')) {
        errorMessage += 'File không tồn tại hoặc không thể truy cập.';
      } else {
        errorMessage += 'Vui lòng thử lại.';
      }

      alert(errorMessage);
    }
  };

  const renderImageGrid = (images) => {
    const imageCount = images.length;

    if (imageCount === 1) {
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
            onError={(e) => {
              console.error('Image load error:', e);
              e.target.style.display = 'none';
            }}
          />
        </div>
      );
    }

    const getGridClasses = (count) => {
      if (count === 2) return 'grid-cols-2';
      if (count === 3) return 'grid-cols-3';
      return 'grid-cols-4';
    };

    return (
      <div
        className={`grid max-w-xs gap-1 md:max-w-md ${getGridClasses(imageCount)}`}
      >
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
              onError={(e) => {
                console.error('Image load error:', e);
                e.target.style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderUnreadDivider = () => {
    return (
      <div className='relative my-2 flex items-center justify-center py-4'>
        <div className='flex-grow border-t border-red-300 dark:border-red-600'></div>
        <div className='mx-4 flex items-center space-x-2 rounded-full bg-red-50 px-3 py-1 dark:bg-red-900/20'>
          <div className='h-2 w-2 animate-pulse rounded-full bg-red-500'></div>
          <span className='text-xs font-medium tracking-wide text-red-600 uppercase dark:text-red-400'>
            Unread Messages
          </span>
        </div>
        <div className='flex-grow border-t border-red-300 dark:border-red-600'></div>
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
          className={`break-words ${
            isSelf
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-black dark:bg-[#212121] dark:text-white'
          } ${
            isLongMessage ? 'rounded-2xl px-4 py-3' : 'rounded-full px-3 py-2'
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

    if (message.type === 'files' && message.files && message.files.length > 0) {
      const images = message.files.filter((file) => file.fileType === 'image');
      const videos = message.files.filter((file) => file.fileType === 'video');
      const otherFiles = message.files.filter(
        (file) => file.fileType !== 'image' && file.fileType !== 'video',
      );

      return (
        <div
          className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
        >
          {message.text && message.text.trim() && (
            <div
              className={`mb-2 break-words ${
                isSelf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 dark:bg-[#212121] dark:text-white'
              } ${
                isLongTextWithFiles
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
            {/* Render image grid */}
            {images.length > 0 && (
              <div className='max-w-xs md:max-w-md'>
                {renderImageGrid(images)}
              </div>
            )}

            {/* Render videos */}
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
                  onError={(e) => {
                    console.error('Video load error:', e);
                  }}
                >
                  <p className='p-2 text-sm text-gray-500'>
                    Video cannot be displayed
                  </p>
                </video>
              </div>
            ))}

            {/* Render other files */}
            {otherFiles.map((file, index) => (
              <div
                key={`file-${index}`}
                className='flex w-full max-w-xs cursor-pointer items-center space-x-3 rounded-lg bg-[#F3F3F3] p-4 hover:bg-gray-100 hover:shadow-sm md:max-w-sm dark:bg-[#404040] hover:dark:bg-[#353535]'
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
                    {formatFileSize(file.size)} •{' '}
                    {getFileTypeLabel(file.fileType)}
                  </p>
                </div>
                <Download
                  size={16}
                  className='flex-shrink-0 text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
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
      {/* Hiển thị time separator nếu có */}
      {timeSeparator && renderTimeSeparator()}

      {/* Hiển thị divider tin nhắn chưa đọc */}
      {showUnreadDivider && renderUnreadDivider()}

      <div
        className={`flex ${isSelf ? 'justify-end' : 'justify-start'} ${
          isGrouped ? 'mt-0.5' : isNewSession ? 'mt-6' : 'mt-3'
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
              className={`mt-1 block text-[11px] text-gray-600 dark:text-neutral-400 ${isSelf ? 'pr-1' : 'pl-8 md:pl-10'} `}
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
