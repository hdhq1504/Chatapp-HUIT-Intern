import React from 'react';
import { MessageCircle } from 'lucide-react';

function WelcomeScreen() {
  return (
    <div className='flex h-full flex-1 flex-col items-center justify-center bg-white dark:bg-[#212121]'>
      <div className='max-w-md text-center'>
        {/* Logo/Icon */}
        <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600'>
          <MessageCircle className='h-10 w-10 text-white' />
        </div>

        {/* Welcome Title */}
        <h1 className='mb-4 text-3xl font-bold text-gray-800 dark:text-white'>Welcome to ChatApp</h1>

        {/* Subtitle */}
        <p className='mb-8 text-lg text-gray-600 dark:text-gray-300'>Choose a conversation to start chatting</p>
      </div>
    </div>
  );
}

export default WelcomeScreen;
