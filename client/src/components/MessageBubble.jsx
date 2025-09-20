import React from 'react';
import { formatMessageTimestamp } from '../storage/helpers';

function MessageBubble({ message, isLast, isGrouped, isNewSession = false, timeSeparator = null }) {
  const isSelf = message.sender === 'self';
  const baseText = message?.content ?? message?.text ?? '';
  const normalizedText = baseText || (message?.type && message.type !== 'text' ? 'Unsupported message' : '');
  const isLongMessage = normalizedText.length > 50;

  const bubbleSpacing = isGrouped ? 'mt-0.5' : isNewSession ? 'mt-6' : 'mt-3';

  return (
    <>
      {timeSeparator && (
        <div className='relative my-2 flex items-center justify-center'>
          <div className='mx-4'>
            <span className='text-xs font-medium text-neutral-600 dark:text-neutral-400'>{timeSeparator}</span>
          </div>
        </div>
      )}

      <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} ${bubbleSpacing}`}>
        <div className={`flex max-w-[85%] flex-col md:max-w-[45%] ${isSelf ? 'items-end' : 'items-start'}`}>
          <div className='flex items-end gap-2'>
            {!isSelf && (
              <div className='flex-shrink-0'>
                {isLast ? (
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500 md:h-8 md:w-8'>
                    <span className='text-xs font-semibold text-white md:text-sm'>M</span>
                  </div>
                ) : (
                  <div className='h-6 w-6 md:h-8 md:w-8' />
                )}
              </div>
            )}

            <div className='min-w-0 flex-1'>
              <div
                className={`break-words ${
                  isSelf ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black dark:bg-[#212121] dark:text-white'
                } ${isLongMessage ? 'rounded-2xl px-4 py-3' : 'rounded-full px-3 py-2'} `}
              >
                <p className={`text-[15px] ${isLongMessage ? 'leading-relaxed' : 'leading-snug'}`}>{normalizedText}</p>
              </div>
            </div>
          </div>

          {isLast && (
            <span
              className={`mt-1 block text-[11px] text-gray-600 dark:text-neutral-400 ${
                isSelf ? 'pr-1' : 'pl-8 md:pl-10'
              }`}
            >
              {formatMessageTimestamp(message.timestamp)}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default MessageBubble;
