import React, { useState } from "react";
import { ChevronUp, ChevronDown, Image, Download, Share2, X, ArrowLeft } from "lucide-react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import Photo1 from "../assets/images/photo_2025_1.png";
import Photo2 from "../assets/images/photo_2025_2.png";
import Photo3 from "../assets/images/photo_2025_3.png";
import Photo4 from "../assets/images/photo_2025_4.png";

/**
 * Component panel chi tiết bên phải hiển thị thông tin chat
 * Bao gồm: thông tin user, cài đặt, ảnh/file đã chia sẻ
 * @param {Function} onClose - Hàm đóng panel details
 * @param {boolean} isMobile
 * @param {boolean} isTablet
 */
function Details({ onClose, isMobile, isTablet }) {
  const [chatSettingsOpen, setChatSettingsOpen] = useState(!isMobile);
  const [privacyHelpOpen, setPrivacyHelpOpen] = useState(!isMobile);
  const [sharedPhotosOpen, setSharedPhotosOpen] = useState(false);
  const [sharedFilesOpen, setSharedFilesOpen] = useState(false);

  // Dữ liệu mẫu ảnh đã chia sẻ
  const sharedPhotos = [
    { name: "", thumbnail: Photo1 },
    { name: "", thumbnail: Photo2 },
    { name: "", thumbnail: Photo3 },
    { name: "", thumbnail: Photo4 },
    { name: "", thumbnail: Photo1 },
    { name: "", thumbnail: Photo2 },
  ];

  // Dữ liệu mẫu file đã chia sẻ
  const sharedFiles = [
    { name: "File 1.docx", thumbnail: "", size: "688.16 KB" },
    { name: "File 2.xlsx", thumbnail: "", size: "688.16 KB" },
    { name: "File 3.pptx", thumbnail: "", size: "688.16 KB" },
    { name: "File 4.pdf", thumbnail: "", size: "688.16 KB" },
    { name: "File 5.docx", thumbnail: "", size: "688.16 KB" },
    { name: "File 6.pptx", thumbnail: "", size: "688.16 KB" },
    { name: "File 7.rar", thumbnail: "", size: "688.16 KB" },
    { name: "index.html", thumbnail: "", size: "688.16 KB" },
    { name: "File 9.pdf", thumbnail: "", size: "688.16 KB" },
    { name: "File 10.pdf", thumbnail: "", size: "688.16 KB" },
  ];

  return (
    <div className={`
      h-screen flex flex-col bg-[#F9F9F9] dark:bg-[#181818] 
      ${isMobile ? 'w-full' : 'w-80'}
      ${isMobile || isTablet ? 'border-l border-gray-200 dark:border-[#3F3F3F]' : ''}
    `}>
      
      {/* Header Section */}
      <div className={`
        border-b border-gray-200 dark:border-[#3F3F3F]
        ${isMobile ? 'px-4 py-3' : 'px-4 py-4'}
      `}>
        
        {/* Header Section (mobile, tablet screen) */}
        {(isMobile || isTablet) && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold">Chat Info</h2>
            </div>
          </div>
        )}

        {/* Profile section */}
        <div className="text-center">
          <div className={`
            rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center mx-auto mb-3
            ${isMobile ? 'w-20 h-20' : 'w-16 h-16'}
          `}>
            <span className={`font-semibold text-white ${isMobile ? 'text-2xl' : 'text-xl'}`}>M</span>
          </div>
          <h3 className={`font-semibold ${isMobile ? 'text-xl' : 'text-lg'}`}>Maria Nelson</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Active 2 hours ago
          </p>
        </div>
      </div>

      {/* Chat Section */}
      <div className={`flex-1 overflow-y-auto ${customScrollbarStyles}`}>
        <div className={`space-y-4 ${isMobile ? 'p-4' : 'p-4'}`}>
          
          {/* Section Chat Settings */}
          <div>
            <button
              onClick={() => setChatSettingsOpen(!chatSettingsOpen)}
              className="flex items-center justify-between w-full py-2 text-left font-semibold hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg px-2 transition-colors duration-200 cursor-pointer"
            >
              <span>Chat settings</span>
              {chatSettingsOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            
            {/* Content for Chat Settings */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                chatSettingsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {chatSettingsOpen && (
                <div className="mt-2 space-y-2 px-2">
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    • Notifications: On
                  </div>
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    • Media auto-download: Wi-Fi only
                  </div>
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    • Disappearing messages: Off
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Help Section */}
          <div>
            <button
              onClick={() => setPrivacyHelpOpen(!privacyHelpOpen)}
              className="flex items-center justify-between w-full py-2 text-left font-semibold hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg px-2 transition-colors duration-200 cursor-pointer"
            >
              <span>Privacy & help</span>
              {privacyHelpOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                privacyHelpOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {privacyHelpOpen && (
                <div className="mt-2 space-y-2 px-2">
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    • Block contact
                  </div>
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    • Report contact
                  </div>
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    • Clear chat history
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shared Photos Section */}
          <div>
            <button
              onClick={() => setSharedPhotosOpen(!sharedPhotosOpen)}
              className="flex items-center justify-between w-full py-2 text-left font-semibold hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg px-2 transition-colors duration-200 cursor-pointer"
            >
              <span>Shared photos</span>
              {sharedPhotosOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                sharedPhotosOpen 
                  ? (isMobile ? "max-h-96 opacity-100" : "max-h-64 opacity-100") 
                  : "max-h-0 opacity-0"
              }`}
            >
              {sharedPhotosOpen && (
                <div className="mt-2 px-2">
                  <div className={`grid gap-2 py-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    {sharedPhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-square cursor-pointer group">
                        <img src={photo.thumbnail} className="w-full h-full rounded-lg object-cover transition-transform duration-200" alt={`Shared photo ${index + 1}`} />
                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200" />
                      </div>
                    ))}
                  </div>
                  
                  {sharedPhotos.length > 6 && (
                    <button className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 font-medium">
                      View all photos
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Shared Files Section */}
          <div>
            <button
              onClick={() => setSharedFilesOpen(!sharedFilesOpen)}
              className="flex items-center justify-between w-full p-2 text-left font-semibold hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <span>Shared files</span>
              {sharedFilesOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                sharedFilesOpen
                  ? (isMobile ? "max-h-80 opacity-100" : "max-h-64 opacity-100")
                  : "max-h-0 opacity-0"
              }`}
            >
              {sharedFilesOpen && (
                <div className={`mt-2 px-2 space-y-2 overflow-y-auto ${customScrollbarStyles} ${isMobile ? 'max-h-72' : 'max-h-56'}`}>
                  {sharedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      {/* Icon và thông tin file */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="bg-[#EFEFEF] dark:bg-slate-700 rounded flex items-center justify-center flex-shrink-0 w-10 h-10">
                          <Image size={18} />
                        </div>
                        
                        {/* Thông tin file: tên và dung lượng */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate text-base">
                            {file.name}
                          </span>
                          <span className="font-light text-gray-500 dark:text-gray-400 text-xs">
                            {file.size}
                          </span>
                        </div>
                      </div>
                      
                      {/* Các nút action cho file */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {/* Nút download */}
                        <button className="p-1.5 hover:bg-[#303030] rounded transition-colors duration-200 cursor-pointer">
                          <Download size={16} />
                        </button>
                        {/* Nút share */}
                        <button className="p-1.5 hover:bg-[#303030] rounded transition-colors duration-200 cursor-pointer">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {sharedFiles.length > 5 && (
                    <button className="w-full py-2 text-sm font-medium text-gray-100 hover:bg-[#303030] rounded-lg cursor-pointer">
                      View all files
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
