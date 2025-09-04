import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

function ImagePreviewModal({ imageUrl, isOpen, onClose, altText = 'Preview image' }) {
  const [scale, setScale] = useState(0.75);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setScale(0.75);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Math.round((prev + 0.25) * 100) / 100, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(Math.round((prev - 0.25) * 100) / 100, 0.75));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

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

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Background overlay */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-xs' onClick={onClose} />

      {/* Close button - Top left */}
      <button
        onClick={onClose}
        className='absolute top-4 left-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#EFEFEF]/75 text-[#181818] transition-all md:h-12 md:w-12'
        title='Close'
      >
        <X size={20} className='md:h-6 md:w-6' />
      </button>

      {/* Main image container */}
      <div
        className='relative flex h-full w-full items-center justify-center p-4 pb-20 md:pb-24'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
      >
        <img
          src={imageUrl}
          alt={altText}
          className='max-h-full max-w-full object-contain transition-transform duration-200 select-none'
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
          draggable={false}
          onLoad={() => {
            setPosition({ x: 0, y: 0 });
          }}
        />
      </div>

      {/* Bottom toolbar */}
      <div className='absolute bottom-4 left-1/2 z-20 -translate-x-1/2 transform'>
        <div className='flex items-center space-x-1 rounded-full bg-black/75 px-3 py-2 backdrop-blur-sm md:space-x-2'>
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.75}
            className='hover:bg-opacity-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-all hover:bg-white hover:text-[#181818] disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:w-10'
            title='Zoom out'
          >
            <ZoomOut size={16} className='md:h-5 md:w-5' />
          </button>

          {/* Zoom percentage */}
          <div className='flex h-8 min-w-[60px] items-center justify-center rounded-full px-2 text-sm font-medium text-white md:h-10 md:min-w-[70px] md:text-base'>
            {Math.round(scale * 100)}%
          </div>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className='hover:bg-opacity-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-all hover:bg-white hover:text-[#181818] disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:w-10'
            title='Zoom in'
          >
            <ZoomIn size={16} className='md:h-5 md:w-5' />
          </button>

          {/* Divider */}
          <div className='bg-opacity-30 mx-1 h-6 w-px bg-white md:mx-2 md:h-8' />

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className='hover:bg-opacity-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-all hover:bg-white hover:text-[#181818] md:h-10 md:w-10'
            title='Rotate'
          >
            <RotateCw size={16} className='md:h-5 md:w-5' />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className='hover:bg-opacity-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-all hover:bg-white hover:text-[#181818] md:h-10 md:w-10'
            title='Download'
          >
            <Download size={16} className='md:h-5 md:w-5' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImagePreviewModal;
