import React, { useState, useCallback } from 'react';
import { File, Image, Video, FileText, Download, Play } from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';
import { formatMessageTimestamp } from '../storage/helpers';

function MessageBubble({ message, isLast, isGrouped, isNewSession = false, timeSeparator = null }) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const isSelf = message.sender === 'self';
  const isLongMessage = message.type === 'text' && message.content?.length > 50;
  const isLongTextWithFiles = message.type === 'files' && message.text?.length > 50;

  const getFileIcon = (type, size = 20) => {
    const iconProps = { size, className: 'flex-shrink-0' };
    switch (type) {
      case 'image':
        return <Image {...iconProps} className='text-blue-400' />;
      case 'video':
        return <Video {...iconProps} className='text-purple-400' />;
      case 'audio':
        return <Play {...iconProps} className='text-green-400' />;
      default:
        return <FileText {...iconProps} className='text-gray-400' />;
    }
  };

  const formatFileSize = useCallback((bytes) => {
    if (!bytes || isNaN(bytes)) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }, []);

  const handleImageClick = useCallback((imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  }, []);

  const handleFileDownload = useCallback(async (file) => {
    if (!file) return;

    try {
      let blob;
      let filename = file.name || `download_${Date.now()}`;

      if (file.dataUrl) {
        const response = await fetch(file.dataUrl);
        blob = await response.blob();
      } else if (file.file instanceof File) {
        blob = file.file;
        filename = file.file.name || filename;
      } else if (file.url) {
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        blob = await response.blob();
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

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      const errorMessage = error.message.includes('HTTP')
        ? 'Không thể tải xuống.'
        : 'Đã xảy ra lỗi khi tải xuống. Vui lòng thử lại.';

      alert(errorMessage);
    }
  }, []);

  const renderImageGrid = useCallback(
    (images) => {
      if (images.length === 1) {
        const image = images[0];
        const imageUrl = image.dataUrl || image.url || image.preview;

        return (
          <div
            className='group relative max-w-xs cursor-pointer overflow-hidden rounded-lg md:max-w-md'
            onClick={() => handleImageClick(imageUrl)}
          >
            <img
              src={imageUrl}
              alt={image.name || 'Shared image'}
              className='h-full w-full object-cover'
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />

            {/* Download overlay for single image */}
            <div className='absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileDownload(image, 0);
                }}
                className='rounded-full bg-black/50 p-2 transition-colors hover:bg-black/70'
              >
                <Download
                  size={16}
                  className='flex-shrink-0 cursor-pointer text-gray-100 transition-colors hover:text-blue-500'
                />
              </button>
            </div>
          </div>
        );
      }

      const gridCols = images.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

      return (
        <div className={`grid max-w-xs gap-1 md:max-w-md ${gridCols}`}>
          {images.map((image, index) => {
            const imageUrl = image.dataUrl || image.url || image.preview;
            return (
              <div
                key={index}
                className='group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800'
                onClick={() => handleImageClick(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={image.name || `Shared image ${index + 1}`}
                  className='h-full w-full object-cover'
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.target.style.display = 'none';
                  }}
                />
                {/* Download overlay for grid images */}
                <div className='absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileDownload(image, index);
                    }}
                    className='rounded-full bg-black/50 p-1 transition-colors hover:bg-black/70'
                  >
                    <Download
                      size={16}
                      className='flex-shrink-0 cursor-pointer text-gray-100 transition-colors hover:text-blue-500'
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    },
    [handleImageClick, handleFileDownload],
  );

  const renderTimeSeparator = useCallback(() => {
    if (!timeSeparator) return null;

    return (
      <div className='relative my-2 flex items-center justify-center'>
        <div className='mx-4'>
          <span className='text-xs font-medium text-neutral-600 dark:text-neutral-400'>{timeSeparator}</span>
        </div>
      </div>
    );
  }, [timeSeparator]);

  const renderMessageContent = () => {
    if (message.type === 'text') {
      return (
        <div
          className={`break-words ${isSelf ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black dark:bg-[#212121] dark:text-white'} ${isLongMessage ? 'rounded-2xl px-4 py-3' : 'rounded-full px-3 py-2'} `}
        >
          <p className={`text-[15px] ${isLongMessage ? 'leading-relaxed' : 'leading-snug'}`}>{message.content}</p>
        </div>
      );
    }

    if (message.type === 'image') {
      const imageUrl = message.dataUrl || message.content;

      return (
        <div
          className='group relative max-w-sm cursor-pointer overflow-hidden rounded-lg md:max-w-md'
          onClick={() => handleImageClick(imageUrl)}
        >
          <img
            src={imageUrl}
            alt='Shared image'
            className='h-full w-full object-cover transition-transform hover:scale-105'
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className='absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFileDownload({ dataUrl: imageUrl, name: 'image.jpg' }, 0);
              }}
              className='rounded-full bg-black/50 p-2 transition-colors hover:bg-black/70'
            >
              <Download
                size={16}
                className='flex-shrink-0 cursor-pointer text-gray-100 transition-colors hover:text-blue-500'
              />
            </button>
          </div>
        </div>
      );
    }

    if (message.type === 'files' && message.files?.length > 0) {
      const images = message.files.filter((file) => file.fileType === 'image');
      const videos = message.files.filter((file) => file.fileType === 'video');
      const otherFiles = message.files.filter((file) => file.fileType !== 'image' && file.fileType !== 'video');

      return (
        <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
          {message.text?.trim() && (
            <div
              className={`mb-2 break-words ${isSelf ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-[#212121] dark:text-white'} ${isLongTextWithFiles ? 'rounded-2xl px-4 py-3' : 'rounded-full px-3 py-2'} `}
            >
              <p className={`text-[15px] ${isLongTextWithFiles ? 'leading-relaxed' : 'leading-snug'}`}>
                {message.text}
              </p>
            </div>
          )}

          <div className={`flex flex-col gap-2 ${isSelf ? 'items-end' : 'items-start'}`}>
            {/* Images */}
            {images.length > 0 && renderImageGrid(images)}

            {/* Videos */}
            {videos.map((file, index) => {
              const videoUrl = file.dataUrl || file.url || file.preview;
              return (
                <div key={`video-${index}`} className='group relative max-w-xs overflow-hidden rounded-lg md:max-w-md'>
                  <video
                    src={videoUrl}
                    className='h-full w-full object-cover'
                    controls
                    preload='metadata'
                    onError={(e) => {
                      console.error('Video load error:', e);
                    }}
                  />
                  <div className='absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100'>
                    <button
                      onClick={() => handleFileDownload(file, `video-${index}`)}
                      className='rounded-full bg-black/50 p-2 transition-colors hover:bg-black/70'
                    >
                      <Download
                        size={16}
                        className='flex-shrink-0 cursor-pointer text-gray-100 transition-colors hover:text-blue-500'
                      />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Other files */}
            {otherFiles.map((file, index) => (
              <div
                key={`file-${index}`}
                className='flex w-full max-w-xs cursor-pointer items-center space-x-3 rounded-lg bg-gray-200 p-4 transition-colors hover:bg-gray-300 md:max-w-sm dark:bg-[#404040] hover:dark:bg-[#353535]'
                onClick={() => handleFileDownload(file, `file-${index}`)}
              >
                <div className='flex-shrink-0'>{getFileIcon(file.fileType, 26)}</div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                    {file.name || 'Unknown file'}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {formatFileSize(file.size)} • {file.fileType || 'file'}
                  </p>
                </div>
                <div className='flex-shrink-0'>
                  <Download
                    size={16}
                    className='flex-shrink-0 cursor-pointer text-neutral-600 transition-colors hover:text-blue-500 dark:text-gray-100'
                  />
                </div>
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
        className={`flex ${isSelf ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : isNewSession ? 'mt-6' : 'mt-3'}`}
      >
        <div className={`flex max-w-[85%] flex-col md:max-w-[45%] ${isSelf ? 'items-end' : 'items-start'}`}>
          <div className='flex items-end gap-2'>
            {!isSelf && (
              <div className='flex-shrink-0'>
                {isLast ? (
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500 md:h-8 md:w-8'>
                    <span className='text-xs font-semibold text-white md:text-sm'>M</span>
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
              className={`mt-1 block text-[11px] text-gray-600 dark:text-neutral-400 ${
                isSelf ? 'pr-1' : 'pl-8 md:pl-10'
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
