export const getTimeDifferenceInMinutes = (timestamp1, timestamp2) => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return Math.abs(date2 - date1) / (1000 * 60);
};

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

export const getTimeSeparator = (currentMessage, previousMessage) => {
  const currentDate = new Date(currentMessage.timestamp);
  const previousDate = previousMessage ? new Date(previousMessage.timestamp) : null;

  if (!previousMessage || currentDate.toDateString() !== previousDate.toDateString()) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (currentDate.toDateString() === today) {
      return 'Hôm nay';
    } else if (currentDate.toDateString() === yesterday) {
      return 'Hôm qua';
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

export const formatMessageTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
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
