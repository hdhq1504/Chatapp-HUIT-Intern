// ==================== STRING UTILITIES ====================
export function getInitial(name = '') {
  return name?.trim()?.charAt(0)?.toUpperCase() || '';
}

// ==================== TIME & DATE UTILITIES ====================
export const getTimeDifferenceInMinutes = (timestamp1, timestamp2) => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return Math.abs(date2 - date1) / (1000 * 60);
};

export const formatMessageTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const getTimeSeparator = (currentMessage, previousMessage) => {
  const currentDate = new Date(currentMessage.timestamp);
  const previousDate = previousMessage ? new Date(previousMessage.timestamp) : null;

  if (!previousMessage || currentDate.toDateString() !== previousDate.toDateString()) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (currentDate.toDateString() === today) {
      return 'Today';
    } else if (currentDate.toDateString() === yesterday) {
      return 'Yesterday';
    } else {
      return currentDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  if (previousMessage) {
    const timeDiff = getTimeDifferenceInMinutes(currentMessage.timestamp, previousMessage.timestamp);
    if (timeDiff > 60) {
      return currentDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
  }

  return null;
};

// ==================== MESSAGE UTILITIES ====================
export const shouldGroupMessages = (currentMessage, previousMessage, maxGapMinutes = 5) => {
  if (!previousMessage) return false;

  const sameSender = currentMessage.sender === previousMessage.sender;
  const timeDiff = getTimeDifferenceInMinutes(currentMessage.timestamp, previousMessage.timestamp);
  const withinTimeGap = timeDiff <= maxGapMinutes;

  return sameSender && withinTimeGap;
};

export const isNewSession = (currentMessage, previousMessage, sessionGapMinutes = 30) => {
  if (!previousMessage) return true;

  const timeDiff = getTimeDifferenceInMinutes(currentMessage.timestamp, previousMessage.timestamp);
  const currentDate = new Date(currentMessage.timestamp).toDateString();
  const previousDate = new Date(previousMessage.timestamp).toDateString();
  const differentDay = currentDate !== previousDate;

  return timeDiff > sessionGapMinutes || differentDay;
};

export const processMessagesForRendering = (messages) => {
  if (!messages || !Array.isArray(messages)) return [];

  return messages.map((message, index) => {
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

    const isGrouped = shouldGroupMessages(message, previousMessage);
    const isFirstInGroup = !isGrouped;
    const isLastInGroup = !nextMessage || !shouldGroupMessages(nextMessage, message);
    const isNewSessionStart = isNewSession(message, previousMessage);
    const timeSeparator = getTimeSeparator(message, previousMessage);

    return {
      ...message,
      isFirst: isFirstInGroup,
      isLast: isLastInGroup,
      isGrouped: isGrouped,
      isNewSession: isNewSessionStart,
      timeSeparator: timeSeparator,
      formattedTime: formatMessageTimestamp(message.timestamp),
    };
  });
};

// ==================== STYLE UTILITIES ====================
export const scrollBar = `
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
`;

// ==================== VALIDATION UTILITIES ====================
export const createValidators = () => ({
  isRequired: (value, message = 'Please enter this field') => {
    return value && value.trim() ? undefined : message;
  },

  isEmail: (value, message = 'This must be an email') => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(value) ? undefined : message;
  },

  minLength: (value, min, message) => {
    return value && value.length >= min ? undefined : message || `Please enter at least ${min} characters`;
  },

  isConfirmed: (value, confirmValue, message = 'Password confirmation does not match') => {
    return value === confirmValue ? undefined : message;
  },
});

// ==================== ID GENERATION UTILITIES ====================
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function getConversationKey(id1, id2) {
  return [id1, id2].sort().join('_');
}
