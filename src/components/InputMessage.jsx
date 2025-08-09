import React, { useState, useRef, useEffect } from "react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import { Send, Paperclip, X, File, Image, Video, FileText } from "lucide-react";

function InputMessage({ onSendMessage, onSendFile, disabled = false }) {
  const [message, setMessage] = useState("");
  const [previewFiles, setPreviewFiles] = useState([]);

  const textareaRef = useRef(null);

  const getFileType = (file) => {
    const fileName = file.name.toLowerCase();
    const extension = fileName.split(".").pop();

    // Image files
    if (
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "svg",
        "ico",
        "tiff",
        "tif",
      ].includes(extension)
    ) {
      return "image";
    }

    // Video files
    if (
      [
        "mp4",
        "avi",
        "mov",
        "wmv",
        "flv",
        "webm",
        "mkv",
        "m4v",
        "3gp",
        "ogv",
      ].includes(extension)
    ) {
      return "video";
    }

    // Audio files
    if (
      [
        "mp3",
        "wav",
        "flac",
        "aac",
        "ogg",
        "wma",
        "m4a",
        "opus",
        "aiff",
      ].includes(extension)
    ) {
      return "audio";
    }

    // PDF files
    if (extension === "pdf") {
      return "pdf";
    }

    // Document files
    if (
      ["doc", "docx", "odt", "rtf", "tex", "txt", "wpd"].includes(extension)
    ) {
      return "document";
    }

    // Spreadsheet files
    if (["xls", "xlsx", "ods", "csv", "tsv"].includes(extension)) {
      return "spreadsheet";
    }

    // Presentation files
    if (["ppt", "pptx", "odp"].includes(extension)) {
      return "presentation";
    }

    // Archive files
    if (
      ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "dmg", "iso"].includes(
        extension,
      )
    ) {
      return "archive";
    }

    // Code files
    if (
      [
        "js",
        "jsx",
        "ts",
        "tsx",
        "html",
        "css",
        "scss",
        "sass",
        "less",
        "py",
        "java",
        "cpp",
        "c",
        "h",
        "cs",
        "php",
        "rb",
        "go",
        "rs",
        "swift",
        "kt",
        "dart",
        "vue",
        "svelte",
        "json",
        "xml",
        "yaml",
        "yml",
        "toml",
        "ini",
        "cfg",
        "conf",
        "sh",
        "bat",
        "ps1",
        "sql",
        "r",
        "scala",
        "clj",
        "hs",
        "elm",
        "lua",
        "pl",
        "pm",
      ].includes(extension)
    ) {
      return "code";
    }

    // Executable files
    if (
      ["exe", "msi", "app", "deb", "rpm", "pkg", "dmg", "apk"].includes(
        extension,
      )
    ) {
      return "executable";
    }

    // Font files
    if (["ttf", "otf", "woff", "woff2", "eot"].includes(extension)) {
      return "font";
    }

    // Fallback to MIME type check for unknown extensions
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.includes("document") || file.type.includes("word"))
      return "document";
    if (file.type.includes("sheet") || file.type.includes("excel"))
      return "spreadsheet";

    return "file";
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image":
        return <Image size={14} className="text-blue-500" />;
      case "video":
        return <Video size={14} className="text-purple-500" />;
      case "audio":
        return <File size={14} className="text-green-500" />;
      case "pdf":
        return <FileText size={14} className="text-red-500" />;
      case "document":
        return <FileText size={14} className="text-blue-600" />;
      case "spreadsheet":
        return <FileText size={14} className="text-green-600" />;
      case "presentation":
        return <FileText size={14} className="text-orange-500" />;
      case "archive":
        return <File size={14} className="text-yellow-600" />;
      case "code":
        return <File size={14} className="text-indigo-500" />;
      case "executable":
        return <File size={14} className="text-red-600" />;
      case "font":
        return <File size={14} className="text-purple-600" />;
      default:
        return <File size={14} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const isMobile = window.innerWidth < 768;
      const maxHeight = isMobile ? 120 : 128;
      const scrollHeight = Math.min(
        textareaRef.current.scrollHeight,
        maxHeight,
      );
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [message]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (previewFiles.length > 0 && !disabled) {
      if (onSendFile) {
        onSendFile(previewFiles, message.trim());
      }
      clearPreview();
      setMessage("");
      return;
    }

    if (message.trim() && !disabled) {
      if (onSendMessage) {
        onSendMessage(message.trim());
      }
      setMessage("");
    }
  };

  const clearPreview = () => {
    previewFiles.forEach((file) => {
      if (file.preview && file.preview.startsWith("blob:")) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setPreviewFiles([]);
  };

  const removePreviewFile = (indexToRemove) => {
    const fileToRemove = previewFiles[indexToRemove];
    if (fileToRemove.preview && fileToRemove.preview.startsWith("blob:")) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setPreviewFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleFileUpload = (e) => {
    if (!disabled) {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        const processedFiles = files.map((file) => {
          const fileType = getFileType(file);
          const processedFile = {
            file: file, // Store the actual file object
            name: file.name,
            size: file.size,
            type: file.type,
            id: Date.now() + Math.random(),
            fileType,
          };

          if (fileType === "image" || fileType === "video") {
            processedFile.preview = URL.createObjectURL(file);
          }

          return processedFile;
        });

        setPreviewFiles((prev) => [...prev, ...processedFiles]);
        e.target.value = "";
      }
    }
  };

  return (
    <div className="sticky bottom-0 z-10 bg-[#F9F9F9] p-3 pb-2 shadow-sm md:p-4 md:pb-2.5 dark:bg-[#212121]">
      <div className="flex items-end space-x-2 md:space-x-3">
        <div className="relative">
          <input
            type="file"
            accept="*/*"
            className="hidden"
            id="file-upload"
            onChange={handleFileUpload}
            disabled={disabled}
            multiple
          />
          <label
            htmlFor="file-upload"
            className={`mb-2 inline-flex rounded-lg p-1.5 md:p-2 ${
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-[#EFEFEF] dark:hover:bg-[#303030]"
            }`}
            title="Attach files"
          >
            <Paperclip size={18} className="md:h-5 md:w-5" />
          </label>
        </div>

        <div className="relative flex-1">
          <div className="relative w-full rounded-xl bg-gray-200 dark:bg-[#303030]">
            {/* Files Preview - Inside textarea */}
            {previewFiles.length > 0 && (
              <div className="p-2 pb-0">
                <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent flex space-x-2 overflow-x-auto pb-2">
                  {previewFiles.map((file, index) => (
                    <div key={file.id} className="group relative flex-shrink-0">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100 dark:bg-[#404040]">
                        {file.fileType === "image" && file.preview ? (
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : file.fileType === "video" && file.preview ? (
                          <video
                            src={file.preview}
                            className="h-full w-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center p-1">
                            {getFileIcon(file.fileType)}
                            <span className="mt-1 w-full truncate text-center text-[8px] text-gray-500 dark:text-gray-400">
                              {file.name.length > 8
                                ? file.name.substring(0, 6) + "..."
                                : file.name}
                            </span>
                          </div>
                        )}

                        {/* Remove button */}
                        <button
                          onClick={() => removePreviewFile(index)}
                          className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#EFEFEF] text-[#212121] opacity-0 transition-opacity group-hover:opacity-100"
                          title="Remove file"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* File info tooltip */}
                      <div className="bg-opacity-70 absolute right-0 bottom-0 left-0 rounded-b-lg bg-black p-1 text-[8px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="truncate">{file.name}</div>
                        <div>{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={"Type a message..."}
              disabled={disabled}
              className={`w-full resize-none overflow-y-auto bg-transparent px-3 py-1.5 pr-8 focus:outline-none md:px-4 md:py-2 md:pr-10 ${customScrollbarStyles} max-h-[120px] text-sm md:max-h-32 md:text-base ${
                disabled ? "cursor-not-allowed opacity-50" : ""
              } ${previewFiles.length > 0 ? "pt-0" : ""}`}
              rows={1}
            />
          </div>
        </div>

        <button
          onClick={handleSendMessage}
          disabled={disabled || (!message.trim() && previewFiles.length === 0)}
          className={`mb-2 rounded-lg px-2.5 py-1.5 font-semibold text-white md:px-3 md:py-2 ${
            disabled || (!message.trim() && previewFiles.length === 0)
              ? "cursor-not-allowed bg-gray-400 opacity-50"
              : "cursor-pointer bg-blue-600 hover:bg-blue-700"
          }`}
          title={previewFiles.length > 0 ? "Send files" : "Send message"}
        >
          <Send size={18} className="md:h-5 md:w-5" />
        </button>
      </div>
    </div>
  );
}

export default InputMessage;
