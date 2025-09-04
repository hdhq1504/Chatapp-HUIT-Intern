import React, { useEffect, useState } from 'react';
import { X, Sun, Moon, Monitor } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside.jsx';
import { useTheme } from '../../hooks/useTheme.jsx';

function SettingModal({ isOpen, onClose }) {
  const [shouldRender, setShouldRender] = useState(false);
  const { themeOption, setTheme } = useTheme();

  const modalRef = useClickOutside(() => handleClose(), isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else if (shouldRender) {
      setTimeout(() => setShouldRender(false), 1);
    }
  }, [isOpen, shouldRender]);

  const handleClose = () => {
    onClose?.();
  };

  const handleChangeTheme = (option) => {
    setTheme(option);
  };

  if (!shouldRender) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity' onClick={handleClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        className='relative z-10 mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#212121]'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4'>
          <h2 className='text-lg font-semibold'>Settings</h2>
          <button
            onClick={handleClose}
            className='cursor-pointer rounded-full p-2 hover:bg-gray-100 dark:hover:bg-[#303030]'
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className='space-y-4 px-4 py-1'>
          {/* General */}
          <div>
            <h3 className='mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300'>General</h3>
            <div className='space-y-1 rounded-xl border border-gray-200 p-3 dark:border-[#3F3F3F]'>
              <div className='mb-2 flex items-center gap-2'>
                <span className='text-sm font-medium'>Appearance</span>
              </div>
              <div className='grid grid-cols-3 gap-2'>
                <button
                  onClick={() => handleChangeTheme('light')}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-colors ${
                    themeOption === 'light'
                      ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-[#1e3a8a]/20 dark:text-blue-400'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-[#3F3F3F] dark:hover:bg-[#303030]'
                  }`}
                >
                  <Sun size={18} />
                  <span className='text-xs font-medium'>Light</span>
                </button>
                <button
                  onClick={() => handleChangeTheme('dark')}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-colors ${
                    themeOption === 'dark'
                      ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-[#1e3a8a]/20 dark:text-blue-400'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-[#3F3F3F] dark:hover:bg-[#303030]'
                  }`}
                >
                  <Moon size={18} />
                  <span className='text-xs font-medium'>Dark</span>
                </button>
                <button
                  onClick={() => handleChangeTheme('system')}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-colors ${
                    themeOption === 'system'
                      ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-[#1e3a8a]/20 dark:text-blue-400'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-[#3F3F3F] dark:hover:bg-[#303030]'
                  }`}
                >
                  <Monitor size={18} />
                  <span className='text-xs font-medium'>System</span>
                </button>
              </div>
              <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                The theme option will be saved for the next time you use the app.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-2 p-3'>
          <button
            onClick={handleClose}
            className='cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-[#3F3F3F] dark:text-gray-300 dark:hover:bg-[#303030]'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingModal;
