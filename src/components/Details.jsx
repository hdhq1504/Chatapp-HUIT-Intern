import React, { useState } from "react";
import { ChevronUp, ChevronDown, Image, MoreHorizontal } from "lucide-react";

const customScrollbarStyles =" \
  [&::-webkit-scrollbar]:w-2 \
  [&::-webkit-scrollbar-track]:rounded-full \
  [&::-webkit-scrollbar-track]:bg-gray-100 \
  [&::-webkit-scrollbar-thumb]:rounded-full \
  [&::-webkit-scrollbar-thumb]:bg-gray-300 \
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700 \
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 \
";

function Details() {
  const [chatSettingsOpen, setChatSettingsOpen] = useState(true);
  const [privacyHelpOpen, setPrivacyHelpOpen] = useState(true);
  const [sharedPhotosOpen, setSharedPhotosOpen] = useState(false);
  const [sharedFilesOpen, setSharedFilesOpen] = useState(false);
  
  const sharedPhotos = [
    { name: "", thumbnail: "" },
    { name: "", thumbnail: "" },
    { name: "", thumbnail: "" },
    { name: "", thumbnail: "" },
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
    <div className="flex flex-col w-80 bg-[#F9F9F9] dark:bg-[#181818]">
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
            {sharedPhotosOpen && (
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-3 gap-4 py-2">
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
              className={`mt-2 space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${sharedFilesOpen ? 'max-h-100 opacity-100' : 'max-h-0 opacity-0'} ${customScrollbarStyles}`}
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
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm font-light">{file.size}</span>
                  </div>
                  <button className="p-1 hover:bg-slate-700 rounded">
                    <MoreHorizontal size={14} />
                  </button>
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
