import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, Image, Download, X, Eye } from 'lucide-react';
import { customScrollbarStyles } from '../../utils/styles.jsx';
import ImagePreviewModal from '../common/ImagePreviewModal.jsx';
import { getInitial } from '../../utils/string.jsx';

function ChatInfo({ onClose, selectedContact }) {
  const [chatSettingsOpen, setChatSettingsOpen] = useState(true);
  const [privacyHelpOpen, setPrivacyHelpOpen] = useState(true);
  const [sharedPhotosOpen, setSharedPhotosOpen] = useState(false);
  const [sharedFilesOpen, setSharedFilesOpen] = useState(false);
  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState({
    open: false,
    url: '',
    name: '',
  });
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);

  const SHARED_MEDIA_KEY_PREFIX = 'shared_media_';
  const getSharedMediaKey = (contactId) =>
    `${SHARED_MEDIA_KEY_PREFIX}${contactId}`;

  const loadSharedMedia = React.useCallback(() => {
    if (!selectedContact?.id) return;
    const key = getSharedMediaKey(selectedContact.id);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSharedPhotos(parsed.photos || []);
        setSharedFiles(parsed.files || []);
        return;
      }
    } catch {
      // ignore
    }
    setSharedPhotos([]);
    setSharedFiles([]);
  }, [selectedContact?.id]);

  useEffect(() => {
    loadSharedMedia();
  }, [selectedContact?.id, loadSharedMedia]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (!selectedContact?.id) return;
      if (e.detail?.contactId === selectedContact.id) {
        loadSharedMedia();
      }
    };
    window.addEventListener('shared-media-updated', handleUpdate);
    return () =>
      window.removeEventListener('shared-media-updated', handleUpdate);
  }, [selectedContact?.id, loadSharedMedia]);

  const formatSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const openImagePreview = (dataUrl, name) => {
    setImagePreview({ open: true, url: dataUrl, name: name || 'Shared image' });
  };
  const closeImagePreview = () =>
    setImagePreview({ open: false, url: '', name: '' });

  const downloadFromDataUrl = (fileName, dataUrl) => {
    try {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName || `download_${Date.now()}`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed', e);
      alert('Không thể tải xuống file.');
    }
  };

  return (
    <div className='flex h-screen w-full flex-col bg-[#F9F9F9] md:w-80 lg:w-90 dark:border-[#3F3F3F] dark:bg-[#181818]'>
      <div className='border-b border-gray-200 px-4 py-3 md:py-4 dark:border-[#3F3F3F]'>
        <div className='mb-4 flex items-center justify-between md:hidden'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={onClose}
              className='cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
            >
              <X size={18} />
            </button>
            <h2 className='text-lg font-semibold'>Chat Info</h2>
          </div>
        </div>

        <div className='text-center'>
          <div className='mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500 md:h-16 md:w-16'>
            <span className='text-2xl font-semibold text-white md:text-xl'>
              {getInitial(selectedContact.name)}
            </span>
          </div>
          <h3 className='text-xl font-semibold md:text-lg'>
            {selectedContact.name}
          </h3>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Active 2 hours ago
          </p>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${customScrollbarStyles}`}>
        <div className='space-y-4 p-4'>
          <div>
            <button
              onClick={() => setChatSettingsOpen(!chatSettingsOpen)}
              className='flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
            >
              <span>Chat settings</span>
              {chatSettingsOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${chatSettingsOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              {chatSettingsOpen && (
                <div className='mt-2 space-y-2 px-2'>
                  <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>
                    Notifications: On
                  </div>
                  <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>
                    Media auto-download: Wi-Fi only
                  </div>
                  <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>
                    Disappearing messages: Off
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={() => setPrivacyHelpOpen(!privacyHelpOpen)}
              className='flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
            >
              <span>Privacy & help</span>
              {privacyHelpOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${privacyHelpOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              {privacyHelpOpen && (
                <div className='mt-2 space-y-2 px-2'>
                  <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>
                    Block contact
                  </div>
                  <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>
                    Report contact
                  </div>
                  <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>
                    Clear chat history
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={() => setSharedPhotosOpen(!sharedPhotosOpen)}
              className='flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
            >
              <span>Shared photos</span>
              {sharedPhotosOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${sharedPhotosOpen
                  ? 'max-h-96 opacity-100 md:max-h-full'
                  : 'max-h-0 opacity-0'
                }`}
            >
              {sharedPhotosOpen && (
                <div
                  className={`mt-2 px-2 ${showAllPhotos ? 'max-h-80 overflow-y-auto' : ''} ${customScrollbarStyles}`}
                >
                  <div
                    className={`grid grid-cols-4 gap-2 py-2 md:grid-cols-3 ${showAllPhotos ? '' : ''}`}
                  >
                    {(showAllPhotos
                      ? sharedPhotos
                      : sharedPhotos.slice(0, 9)
                    ).map((photo, index) => (
                      <div
                        key={index}
                        className='group relative aspect-square cursor-pointer'
                        onClick={() =>
                          openImagePreview(photo.dataUrl, photo.name)
                        }
                      >
                        <img
                          src={photo.dataUrl}
                          className='h-full w-full rounded-lg object-cover transition-transform duration-200'
                          alt={photo.name || `Shared photo ${index + 1}`}
                        />
                        <div className='bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 rounded-lg transition-all duration-200' />
                        <div className='absolute top-1 right-1 z-10 hidden gap-1 group-hover:flex'>
                          <button
                            className='flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-black/50 text-white backdrop-blur-sm'
                            title='Preview'
                            onClick={(e) => {
                              e.stopPropagation();
                              openImagePreview(photo.dataUrl, photo.name);
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className='flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-black/50 text-white backdrop-blur-sm'
                            title='Download'
                            onClick={(e) => {
                              e.stopPropagation();
                              const name =
                                photo.name || `photo_${index + 1}.jpg`;
                              downloadFromDataUrl(name, photo.dataUrl);
                            }}
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {sharedPhotos.length > 9 && (
                    <button
                      className='w-full py-2 text-sm font-medium text-blue-500 hover:text-blue-600'
                      onClick={() => setShowAllPhotos((v) => !v)}
                    >
                      {showAllPhotos ? 'Show less' : 'View all photos'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={() => setSharedFilesOpen(!sharedFilesOpen)}
              className='flex w-full cursor-pointer items-center justify-between rounded-lg p-2 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
            >
              <span>Shared files</span>
              {sharedFilesOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${sharedFilesOpen
                  ? 'max-h-80 opacity-100 md:max-h-64'
                  : 'max-h-0 opacity-0'
                }`}
            >
              {sharedFilesOpen && (
                <div
                  className={`mt-2 ${showAllFiles ? 'max-h-80' : 'max-h-56'} space-y-2 overflow-y-auto px-2 md:max-h-64 ${customScrollbarStyles}`}
                >
                  {(showAllFiles ? sharedFiles : sharedFiles.slice(0, 3)).map(
                    (file, index) => (
                      <div
                        key={index}
                        className='flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
                      >
                        <div className='flex min-w-0 flex-1 items-center space-x-3'>
                          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[#EFEFEF] dark:bg-slate-700'>
                            <Image size={18} />
                          </div>

                          <div className='flex min-w-0 flex-1 flex-col'>
                            <span className='truncate text-base font-medium'>
                              {file.name}
                            </span>
                            <span className='text-xs font-light text-gray-500 dark:text-gray-400'>
                              {formatSize(file.size)}
                            </span>
                          </div>
                        </div>

                        <div className='flex flex-shrink-0 items-center space-x-1'>
                          {file.dataUrl && (
                            <button
                              className='cursor-pointer rounded p-1.5 transition-colors duration-200 hover:bg-[#303030]'
                              title='Preview'
                              onClick={() =>
                                openImagePreview(file.dataUrl, file.name)
                              }
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button
                            className='cursor-pointer rounded p-1.5 transition-colors duration-200 hover:bg-[#303030]'
                            title='Download'
                            onClick={() => {
                              if (file.dataUrl) {
                                downloadFromDataUrl(
                                  file.name || `file_${index + 1}`,
                                  file.dataUrl,
                                );
                              } else {
                                alert(
                                  'File này không có dữ liệu để tải xuống.',
                                );
                              }
                            }}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    ),
                  )}

                  {sharedFiles.length > 3 && (
                    <button
                      className='w-full cursor-pointer rounded-lg py-2 text-sm font-medium text-blue-500 hover:text-blue-600'
                      onClick={() => setShowAllFiles((v) => !v)}
                    >
                      {showAllFiles ? 'Show less' : 'View all files'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImagePreviewModal
        imageUrl={imagePreview.url}
        isOpen={imagePreview.open}
        onClose={closeImagePreview}
        altText={imagePreview.name}
      />
    </div>
  );
}

export default ChatInfo;
