import React, { useState } from "react";
import { ChevronUp, ChevronDown, Image, MoreHorizontal } from "lucide-react";

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
  ];

  return (
    <div className="flex flex-col w-80 bg-[#303030] dark:bg-[#181818]">
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
                        className="w-full rounded object-cover"
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
            {sharedFilesOpen && (
              <div className="mt-2 space-y-2">
                {sharedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center">
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
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3 mt-auto">
        <button className="w-full opacity-30 bg-red-600 hover:bg-red-700 hover:opacity-100 py-2 rounded-lg font-semibold transition cursor-pointer">
          Block User
        </button>
        <button className="w-full opacity-30 bg-blue-600 hover:bg-blue-700 hover:opacity-100 py-2 rounded-lg font-semibold transition cursor-pointer">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Details;
