import React, { useState } from "react";
import { ChevronUp, ChevronDown, Image, Download, Share2, X } from "lucide-react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import Photo1 from "../assets/images/photo_2025_1.png";
import Photo2 from "../assets/images/photo_2025_2.png";
import Photo3 from "../assets/images/photo_2025_3.png";
import Photo4 from "../assets/images/photo_2025_4.png";
import { getInitial } from "../utils/string.jsx";

function Details({ onClose, selectedContact }) {
  const [chatSettingsOpen, setChatSettingsOpen] = useState(true);
  const [privacyHelpOpen, setPrivacyHelpOpen] = useState(true);
  const [sharedPhotosOpen, setSharedPhotosOpen] = useState(false);
  const [sharedFilesOpen, setSharedFilesOpen] = useState(false);

  const sharedPhotos = [
    { name: "", thumbnail: Photo1 },
    { name: "", thumbnail: Photo2 },
    { name: "", thumbnail: Photo3 },
    { name: "", thumbnail: Photo4 },
  ];

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
    <div className="
      h-screen flex flex-col bg-[#F9F9F9] dark:bg-[#181818] 
      w-full md:w-80
      border-l border-gray-200 dark:border-[#3F3F3F]
    ">
      <div className="border-b border-gray-200 dark:border-[#3F3F3F] px-4 py-3 md:py-4">

        <div className="flex items-center justify-between mb-4 md:hidden">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold">Chat Info</h2>
          </div>
        </div>

        <div className="text-center">
          <div className="
            rounded-full bg-gradient-to-r from-pink-500 to-orange-500 
            flex items-center justify-center mx-auto mb-3
            w-20 h-20 md:w-16 md:h-16
          ">
            <span className="font-semibold text-white text-2xl md:text-xl">{getInitial(selectedContact.name)}</span>
          </div>
          <h3 className="font-semibold text-xl md:text-lg">{selectedContact.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Active 2 hours ago
          </p>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${customScrollbarStyles}`}>
        <div className="space-y-4 p-4">
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
                  ? "max-h-96 md:max-h-64 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {sharedPhotosOpen && (
                <div className="mt-2 px-2">
                  <div className="grid gap-2 py-2 grid-cols-4 md:grid-cols-3">
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
                  ? "max-h-80 md:max-h-64 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {sharedFilesOpen && (
                <div className={`mt-2 px-2 space-y-2 overflow-y-auto max-h-72 md:max-h-56 ${customScrollbarStyles}`}>
                  {sharedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="bg-[#EFEFEF] dark:bg-slate-700 rounded flex items-center justify-center flex-shrink-0 w-10 h-10">
                          <Image size={18} />
                        </div>
                        
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate text-base">
                            {file.name}
                          </span>
                          <span className="font-light text-gray-500 dark:text-gray-400 text-xs">
                            {file.size}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button className="p-1.5 hover:bg-[#303030] rounded transition-colors duration-200 cursor-pointer">
                          <Download size={16} />
                        </button>
                        
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
