import React, { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal.jsx";
import { File, Image, Video, FileText, Download, Play } from "lucide-react";

function MessageBubble({ message, isFirst, isLast, isGrouped }) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const isSelf = message.sender === "self";
  const isLongMessage = message.type === "text" && message.content && message.content.length > 50;

  const getFileIcon = (type, size = 20) => {
    const iconProps = { size, className: "flex-shrink-0" };
    switch (type) {
      case 'image': return <Image {...iconProps} className="text-blue-500" />;
      case 'video': return <Video {...iconProps} className="text-purple-500" />;
      case 'audio': return <Play {...iconProps} className="text-green-500" />;
      case 'pdf': return <FileText {...iconProps} className="text-red-500" />;
      case 'document': return <FileText {...iconProps} className="text-blue-600" />;
      case 'spreadsheet': return <FileText {...iconProps} className="text-green-600" />;
      default: return <File {...iconProps} className="text-gray-500" />;
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

  const handleFileDownload = (file) => {
    const url = file.url || URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (!file.url && file instanceof File) {
      URL.revokeObjectURL(url);
    }
  };

  const renderMessageContent = () => {
    if (message.type === "text") {
      return (
        <div
          className={`
            break-words px-3 py-2
            ${isSelf 
              ? "bg-blue-600 text-white rounded-2xl rounded-br-md" 
              : "bg-gray-100 dark:bg-[#212121] text-gray-900 dark:text-white rounded-2xl rounded-bl-md"
            }
            ${isGrouped ? (isSelf ? "rounded-tr-md" : "rounded-tl-md") : ""}
          `}
        >
          <p className={`text-[13px] md:text-sm ${isLongMessage ? "leading-relaxed" : "leading-snug"}`}>
            {message.content}
          </p>
        </div>
      );
    }

    if (message.type === "image") {
      return (
        <div 
          className="overflow-hidden cursor-pointer max-w-xs md:max-w-sm rounded-2xl" 
          onClick={() => handleImageClick(message.content)}
        >
          <img 
            src={message.content} 
            alt="Shared image"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (message.type === "files" && message.files && message.files.length > 0) {
      return (
        <div className={`
          max-w-xs md:max-w-sm
          ${isSelf 
            ? "bg-blue-600 text-white rounded-2xl rounded-br-md" 
            : "bg-gray-100 dark:bg-[#212121] text-gray-900 dark:text-white rounded-2xl rounded-bl-md"
          }
          ${isGrouped ? (isSelf ? "rounded-tr-md" : "rounded-tl-md") : ""}
        `}>
          {message.text && message.text.trim() && (
            <div className="px-3 pt-2 pb-1">
              <p className="text-[13px] md:text-sm leading-snug">
                {message.text}
              </p>
            </div>
          )}
          
          <div className={`space-y-2 ${message.text && message.text.trim() ? 'p-3 pt-1' : 'p-3'}`}>
            {message.files.map((file, index) => {
              if (file.fileType === 'image') {
                return (
                  <div
                    key={index}
                    className="overflow-hidden cursor-pointer rounded-lg"
                    onClick={() => handleImageClick(file.url || file.preview)}
                  >
                    <img 
                      src={file.url || file.preview} 
                      alt={file.name}
                      className="w-full max-h-48 object-cover"
                    />
                  </div>
                );
              }
              
              if (file.fileType === 'video') {
                return (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <video 
                      src={file.url || file.preview}
                      className="w-full max-h-48 object-cover"
                      controls
                      preload="metadata"
                    />
                  </div>
                );
              }
              
              return (
                <div
                  key={index}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg cursor-pointer
                    ${isSelf 
                      ? "bg-blue-700 hover:bg-blue-800" 
                      : "bg-white dark:bg-[#303030] hover:bg-gray-50 dark:hover:bg-[#404040]"
                    }
                  `}
                  onClick={() => handleFileDownload(file)}
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(file.fileType, 24)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isSelf ? "text-white" : "text-gray-900 dark:text-white"
                    }`}>
                      {file.name}
                    </p>
                    <p className={`text-xs ${
                      isSelf ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {formatFileSize(file.size)} • {file.fileType}
                    </p>
                  </div>
                  <Download size={16} className={`
                    flex-shrink-0 ${isSelf ? "text-blue-200" : "text-gray-400"}
                  `} />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className={`flex ${isSelf ? "justify-end" : "justify-start"} ${isFirst ? "mt-2" : "mt-0.5"}`}>
        <div className={`flex flex-col max-w-[90%] md:max-w-[75%] ${isSelf ? 'items-end' : 'items-start'}`}>
          <div className="flex items-end gap-2">
            {!isSelf && (
              <div className="flex-shrink-0">
                {isLast ? (
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center">
                    <span className="text-xs md:text-sm font-semibold text-white">M</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 md:w-8 md:h-8" />
                )}
              </div>
            )}
            
            <div className="min-w-0">
              {renderMessageContent()}
            </div>
          </div>
          
          {isLast && (
            <span className={`
              block text-[11px] text-gray-500 dark:text-gray-400 mt-1
              ${isSelf ? "pr-1" : "pl-8 md:pl-10"}
            `}>
              {message.timestamp}
            </span>
          )}
        </div>
      </div>

      <ImagePreviewModal
        imageUrl={selectedImageUrl}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        altText="Shared image"
      />
    </>
  );
}

export default MessageBubble;
