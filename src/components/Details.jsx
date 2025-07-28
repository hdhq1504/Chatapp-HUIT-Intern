import React, { useState } from "react";
import { ChevronUp, ChevronDown, Image, Download, Share2 } from "lucide-react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import Photo1 from "../assets/images/photo_2025_1.png";
import Photo2 from "../assets/images/photo_2025_2.png";
import Photo3 from "../assets/images/photo_2025_3.png";
import Photo4 from "../assets/images/photo_2025_4.png";

function Details() {
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
    <div className="fixed right-0 top-0 h-screen w-80 flex flex-col bg-[#F9F9F9] dark:bg-[#181818] z-30">
      <div>
        {/* Profile Header */}
        <div className="p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-semibold">M</span>
          </div>
          <h3 className="font-semibold text-lg">Maria Nelson</h3>
        </div>

        {/* Settings Sections */}
        <div className="p-4 space-y-4">
          {/* Chat Settings */}
          <div>
            <button
              onClick={() => setChatSettingsOpen(!chatSettingsOpen)}
              className="flex items-center justify-between w-full py-2 text-left font-semibold"
            >
              <span>Chat settings</span>
              {chatSettingsOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>

          {/* Privacy & Help */}
          <div>
            <button
              onClick={() => setPrivacyHelpOpen(!privacyHelpOpen)}
              className="flex items-center justify-between w-full py-2 text-left font-semibold"
            >
              <span>Privacy & help</span>
              {privacyHelpOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>

          {/* Shared Photos */}
          <div>
            <button
              onClick={() => setSharedPhotosOpen(!sharedPhotosOpen)}
              className="flex items-center justify-between w-full py-2 text-left font-semibold"
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
                sharedPhotosOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {sharedPhotosOpen && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-3 gap-4 md:gap-3 py-2">
                    {sharedPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center"
                      >
                        <img
                          src={photo.thumbnail}
                          className="w-22 h-22 rounded object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shared Files */}
          <div>
            <button
              onClick={() => setSharedFilesOpen(!sharedFilesOpen)}
              className="flex items-center justify-between w-full py-2 text-left font-semibold"
            >
              <span>Shared files</span>
              {sharedFilesOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            <div
              className={`mt-2 space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${
                sharedFilesOpen
                  ? "max-h-100 md:max-h-64 opacity-100"
                  : "max-h-0 opacity-0"
              } ${customScrollbarStyles}`}
            >
              {sharedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#EFEFEF] dark:bg-slate-700 rounded flex items-center justify-center">
                      <Image size={20} />
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 ml-3">
                    <span
                      className={`font-medium ${
                        file.name.length > 20 ? "line-clamp-1" : ""
                      }`}
                    >
                      {file.name}
                    </span>
                    <span className="text-[12px] font-light">{file.size}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-[#303030] rounded">
                      <Download size={18} />
                    </button>
                    <button className="p-2 hover:bg-[#303030] rounded">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
