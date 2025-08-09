import React, { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal.jsx";
import { File, Image, Video, FileText, Download, Play } from "lucide-react";

function MessageBubble({ message, isFirst, isLast, isGrouped }) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const isSelf = message.sender === "self";
  const isLongMessage =
    message.type === "text" && message.content && message.content.length > 50;

  const getFileIcon = (type, size = 20) => {
    const iconProps = { size, className: "flex-shrink-0" };
    switch (type) {
      case "image":
        return <Image {...iconProps} className="text-blue-500" />;
      case "video":
        return <Video {...iconProps} className="text-purple-500" />;
      case "audio":
        return <Play {...iconProps} className="text-green-500" />;
      case "pdf":
        return <FileText {...iconProps} className="text-red-500" />;
      case "document":
        return <FileText {...iconProps} className="text-blue-600" />;
      case "spreadsheet":
        return <FileText {...iconProps} className="text-green-600" />;
      case "presentation":
        return <FileText {...iconProps} className="text-orange-500" />;
      case "archive":
        return <File {...iconProps} className="text-yellow-600" />;
      case "code":
        return <File {...iconProps} className="text-indigo-500" />;
      case "executable":
        return <File {...iconProps} className="text-red-600" />;
      case "font":
        return <File {...iconProps} className="text-purple-600" />;
      default:
        return <File {...iconProps} className="text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type) => {
    switch (type) {
      case "image":
        return "Image";
      case "video":
        return "Video";
      case "audio":
        return "Audio";
      case "pdf":
        return "PDF";
      case "document":
        return "Document";
      case "spreadsheet":
        return "Spreadsheet";
      case "presentation":
        return "Presentation";
      case "archive":
        return "Archive";
      case "code":
        return "Code";
      case "executable":
        return "Executable";
      case "font":
        return "Font";
      default:
        return "File";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const handleFileDownload = (file) => {
    try {
      // Use the stored File object if available, otherwise use the URL
      if (file.file && file.file instanceof File) {
        const url = URL.createObjectURL(file.file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Clean up the temporary URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } else if (file.url) {
        // Fallback to using existing URL
        const a = document.createElement("a");
        a.href = file.url;
        a.download = file.name;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      // Show user-friendly error message
      alert("Unable to download file. Please try again.");
    }
  };

  const renderMessageContent = () => {
    if (message.type === "text") {
      return (
        <div
          className={`px-3 py-2 break-words ${
            isSelf
              ? "rounded-2xl rounded-br-md bg-blue-600 text-white"
              : "rounded-2xl rounded-bl-md bg-gray-100 text-gray-900 dark:bg-[#212121] dark:text-white"
          } ${isGrouped ? (isSelf ? "rounded-tr-md" : "rounded-tl-md") : ""} `}
        >
          <p
            className={`text-[13px] md:text-sm ${isLongMessage ? "leading-relaxed" : "leading-snug"}`}
          >
            {message.content}
          </p>
        </div>
      );
    }

    if (message.type === "image") {
      return (
        <div
          className="max-w-xs cursor-pointer overflow-hidden rounded-2xl md:max-w-sm"
          onClick={() => handleImageClick(message.content)}
        >
          <img
            src={message.content}
            alt="Shared image"
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    if (message.type === "files" && message.files && message.files.length > 0) {
      return (
        <div
          className={`max-w-xs md:max-w-sm ${
            isSelf
              ? "rounded-2xl rounded-br-md bg-blue-500 text-white"
              : "rounded-2xl rounded-bl-md bg-gray-100 text-gray-900 dark:bg-[#212121] dark:text-white"
          } ${isGrouped ? (isSelf ? "rounded-tr-md" : "rounded-tl-md") : ""} `}
        >
          {message.text && message.text.trim() && (
            <div className="px-3 pt-2 pb-1">
              <p className="text-[13px] leading-snug md:text-sm">
                {message.text}
              </p>
            </div>
          )}

          <div
            className={`space-y-2 ${message.text && message.text.trim() ? "p-3 pt-1" : "p-3"}`}
          >
            {message.files.map((file, index) => {
              if (file.fileType === "image") {
                return (
                  <div
                    key={index}
                    className="cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => handleImageClick(file.url || file.preview)}
                  >
                    <img
                      src={file.url || file.preview}
                      alt={file.name}
                      className="max-h-48 w-full object-cover"
                      onError={(e) => {
                        console.error("Image load error:", e);
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                );
              }

              if (file.fileType === "video") {
                return (
                  <div key={index} className="overflow-hidden rounded-lg">
                    <video
                      src={file.url || file.preview}
                      className="max-h-48 w-full object-cover"
                      controls
                      preload="metadata"
                      onError={(e) => {
                        console.error("Video load error:", e);
                      }}
                    >
                      <p className="p-2 text-sm text-gray-500">
                        Video cannot be displayed
                      </p>
                    </video>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className={`flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors ${
                    isSelf
                      ? "bg-[#212121] hover:bg-[#303030]"
                      : "bg-white hover:bg-gray-50 dark:bg-[#212121] dark:hover:bg-[#303030]"
                  } `}
                  onClick={() => handleFileDownload(file)}
                  title={`Click to download ${file.name}`}
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(file.fileType, 24)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-900 dark:text-gray-100">
                      {formatFileSize(file.size)} •{" "}
                      {getFileTypeLabel(file.fileType)}
                    </p>
                  </div>
                  <Download size={16} className="flex-shrink-0 text-gray-100" />
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
      <div
        className={`flex ${isSelf ? "justify-end" : "justify-start"} ${isFirst ? "mt-2" : "mt-0.5"}`}
      >
        <div
          className={`flex max-w-[90%] flex-col md:max-w-[75%] ${isSelf ? "items-end" : "items-start"}`}
        >
          <div className="flex items-end gap-2">
            {!isSelf && (
              <div className="flex-shrink-0">
                {isLast ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500 md:h-8 md:w-8">
                    <span className="text-xs font-semibold text-white md:text-sm">
                      M
                    </span>
                  </div>
                ) : (
                  <div className="h-6 w-6 md:h-8 md:w-8" />
                )}
              </div>
            )}

            <div className="min-w-0">{renderMessageContent()}</div>
          </div>

          {isLast && (
            <span
              className={`mt-1 block text-[11px] text-gray-500 dark:text-gray-400 ${isSelf ? "pr-1" : "pl-8 md:pl-10"} `}
            >
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
