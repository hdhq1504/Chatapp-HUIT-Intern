import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

/**
 * Component modal để xem preview ảnh với các tính năng zoom, rotate, download
 * @param {string} imageUrl - URL của ảnh cần hiển thị
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {Function} onClose - Hàm đóng modal
 * @param {string} altText - Alt text cho ảnh (optional)
 */
function ImagePreviewModal({ imageUrl, isOpen, onClose, altText = "Preview image" }) {
  const [scale, setScale] = useState(0.75);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset các giá trị khi modal đóng/mở
  useEffect(() => {
    if (isOpen) {
      setScale(0.75);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Xử lý đóng modal khi nhấn ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Xử lý zoom in
  const handleZoomIn = () => {
    setScale(prev => Math.min(Math.round((prev + 0.25) * 100) / 100, 3));
  };

  // Xử lý zoom out
  const handleZoomOut = () => {
    setScale(prev => Math.max(Math.round((prev - 0.25) * 100) / 100, 0.75));
  };

  // Xử lý rotate
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Xử lý download ảnh
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Xử lý bắt đầu kéo ảnh
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // Xử lý kéo ảnh
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Xử lý kết thúc kéo ảnh
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Xử lý wheel để zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-opacity-90 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header với các nút điều khiển */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-opacity-50">
          <div className="flex justify-between items-center p-2">
            <div className="flex items-center space-x-4">
              {/* Zoom controls */}
              <div className="flex items-center space-x-2 bg-opacity-30 rounded-lg p-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
                  disabled={scale <= 0.25}
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-white text-sm font-medium min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
                  disabled={scale >= 3}
                >
                  <ZoomIn size={18} />
                </button>
              </div>

              {/* Rotate button */}
              <button
                onClick={handleRotate}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-colors bg-opacity-30"
              >
                <RotateCw size={18} />
              </button>

              {/* Download button */}
              <button
                onClick={handleDownload}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-colors bg-opacity-30"
              >
                <Download size={18} />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div 
          className="flex-1 flex items-center justify-center p-4 cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
            draggable={false}
            onLoad={() => {
              // Reset position when image loads
              setPosition({ x: 0, y: 0 });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ImagePreviewModal;
