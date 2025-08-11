import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside.jsx';

function DeleteChatDialog({ isOpen, onClose, onConfirm }) {
  const [shouldRender, setShouldRender] = useState(false);

  const modalRef = useClickOutside(() => handleClose(), isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else if (shouldRender) {
      setTimeout(() => setShouldRender(false), 10);
    }
  }, [isOpen, shouldRender]);

  const handleClose = () => {
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] transition-opacity duration-300 ease-out'
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div
          ref={modalRef}
          className='w-full max-w-md transform rounded-xl bg-white p-6 shadow-2xl transition-all duration-300 ease-out md:max-w-xl dark:bg-[#303030]'
        >
          {/* Header */}
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/50'>
                <AlertTriangle
                  size={20}
                  className='text-red-500 dark:text-red-400'
                />
              </div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                Delete Chat
              </h3>
            </div>
            <button
              onClick={handleClose}
              className='cursor-pointer rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300'
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className='mb-5 ml-12'>
            <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
              Once you delete your copy of this conversation, it cannot be
              undone.
            </p>
          </div>

          {/* Actions */}
          <div className='ml-12 flex justify-start gap-2.5'>
            <button
              onClick={() => {
                onConfirm();
                handleClose();
              }}
              className='cursor-pointer rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none dark:bg-red-700 dark:hover:bg-red-800'
            >
              Delete
            </button>
            <button
              onClick={handleClose}
              className='cursor-pointer rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-[#181818] hover:bg-gray-300 focus:outline-none dark:text-[#181818] dark:hover:bg-gray-300'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteChatDialog;
