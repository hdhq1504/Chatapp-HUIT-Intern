import React from 'react';
import { Phone, Video, Info, ArrowLeft } from 'lucide-react';
import { getInitial } from '../../storage/helpers/index.js';

function MessageHeader({ setShowDetails, onBackToSidebar, selectedContact }) {
  if (!selectedContact) {
    return null;
  }

  return (
    <div className='sticky top-0 z-10 bg-[#F9F9F9] px-3 py-2.5 shadow-sm md:p-4 dark:bg-[#212121]'>
      <div className='flex items-center justify-between'>
        <div className='flex min-w-0 flex-1 items-center space-x-2 md:space-x-3'>
          <button
            className='block cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] md:hidden dark:hover:bg-[#303030]'
            onClick={onBackToSidebar}
          >
            <ArrowLeft size={18} className='md:h-5 md:w-5' />
          </button>

          <div className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500 md:h-10 md:w-10'>
            <span className='text-xs font-semibold text-white md:text-sm'>{getInitial(selectedContact.name)}</span>
          </div>

          <div className='flex min-w-0 flex-col'>
            <h3 className='truncate text-sm font-semibold md:text-base'>{selectedContact.name}</h3>

            <span
              className={`inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-0.25 text-[10px] font-medium md:px-2 md:text-xs ${
                selectedContact.active
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full md:h-2 md:w-2 ${
                  selectedContact.active ? 'bg-green-500' : 'bg-gray-400'
                }`}
              ></span>
              {selectedContact.active ? 'Active Now' : 'Offline'}
            </span>
          </div>
        </div>

        <div className='flex flex-shrink-0 space-x-1 md:space-x-2'>
          <button className='cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]' title='Call'>
            <Phone size={18} className='md:h-5 md:w-5' />
          </button>

          <button
            className='cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
            title='Video Call'
          >
            <Video size={18} className='md:h-5 md:w-5' />
          </button>

          <button
            className='cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
            onClick={() => setShowDetails((prev) => !prev)}
            title='Chat Info'
          >
            <Info size={18} className='md:h-5 md:w-5' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageHeader;
