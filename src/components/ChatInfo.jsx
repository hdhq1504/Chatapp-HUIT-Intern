import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Image,
  Download,
  Share2,
  X,
} from "lucide-react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import Photo1 from "../assets/images/photo_2025_1.png";
import Photo2 from "../assets/images/photo_2025_2.png";
import Photo3 from "../assets/images/photo_2025_3.png";
import Photo4 from "../assets/images/photo_2025_4.png";
import { getInitial } from "../utils/string.jsx";

function ChatInfo({ onClose, selectedContact }) {
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
    <div className="flex h-screen w-full flex-col bg-[#F9F9F9] md:w-80 dark:border-[#3F3F3F] dark:bg-[#181818]">
      <div className="border-b border-gray-200 px-4 py-3 md:py-4 dark:border-[#3F3F3F]">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold">Chat Info</h2>
          </div>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500 md:h-16 md:w-16">
            <span className="text-2xl font-semibold text-white md:text-xl">
              {getInitial(selectedContact.name)}
            </span>
          </div>
          <h3 className="text-xl font-semibold md:text-lg">
            {selectedContact.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Active 2 hours ago
          </p>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${customScrollbarStyles}`}>
        <div className="space-y-4 p-4">
          <div>
            <button
              onClick={() => setChatSettingsOpen(!chatSettingsOpen)}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]"
            >
              <span>Chat settings</span>
              {chatSettingsOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                chatSettingsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {chatSettingsOpen && (
                <div className="mt-2 space-y-2 px-2">
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    Notifications: On
                  </div>
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    Media auto-download: Wi-Fi only
                  </div>
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    Disappearing messages: Off
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={() => setPrivacyHelpOpen(!privacyHelpOpen)}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]"
            >
              <span>Privacy & help</span>
              {privacyHelpOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                privacyHelpOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {privacyHelpOpen && (
                <div className="mt-2 space-y-2 px-2">
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    Block contact
                  </div>
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    Report contact
                  </div>
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    Clear chat history
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={() => setSharedPhotosOpen(!sharedPhotosOpen)}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]"
            >
              <span>Shared photos</span>
              {sharedPhotosOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                sharedPhotosOpen
                  ? "max-h-96 opacity-100 md:max-h-64"
                  : "max-h-0 opacity-0"
              }`}
            >
              {sharedPhotosOpen && (
                <div className="mt-2 px-2">
                  <div className="grid grid-cols-4 gap-2 py-2 md:grid-cols-3">
                    {sharedPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square cursor-pointer"
                      >
                        <img
                          src={photo.thumbnail}
                          className="h-full w-full rounded-lg object-cover transition-transform duration-200"
                          alt={`Shared photo ${index + 1}`}
                        />
                        <div className="bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 rounded-lg transition-all duration-200" />
                      </div>
                    ))}
                  </div>

                  {sharedPhotos.length > 6 && (
                    <button className="w-full py-2 text-sm font-medium text-blue-500 hover:text-blue-600">
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
              className="flex w-full cursor-pointer items-center justify-between rounded-lg p-2 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]"
            >
              <span>Shared files</span>
              {sharedFilesOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                sharedFilesOpen
                  ? "max-h-80 opacity-100 md:max-h-64"
                  : "max-h-0 opacity-0"
              }`}
            >
              {sharedFilesOpen && (
                <div
                  className={`mt-2 max-h-72 space-y-2 overflow-y-auto px-2 md:max-h-56 ${customScrollbarStyles}`}
                >
                  {sharedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]"
                    >
                      <div className="flex min-w-0 flex-1 items-center space-x-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[#EFEFEF] dark:bg-slate-700">
                          <Image size={18} />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-base font-medium">
                            {file.name}
                          </span>
                          <span className="text-xs font-light text-gray-500 dark:text-gray-400">
                            {file.size}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center space-x-1">
                        <button className="cursor-pointer rounded p-1.5 transition-colors duration-200 hover:bg-[#303030]">
                          <Download size={16} />
                        </button>

                        <button className="cursor-pointer rounded p-1.5 transition-colors duration-200 hover:bg-[#303030]">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {sharedFiles.length > 5 && (
                    <button className="w-full cursor-pointer rounded-lg py-2 text-sm font-medium text-gray-100 hover:bg-[#303030]">
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

export default ChatInfo;
