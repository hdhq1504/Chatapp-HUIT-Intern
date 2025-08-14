/**
 * Tính toán thời gian giữa hai tin nhắn (phút)
 */
export const getTimeDifferenceInMinutes = (timestamp1, timestamp2) => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return Math.abs(date2 - date1) / (1000 * 60);
};

/**
 * Kiểm tra có nên gộp tin nhắn không
 */
export const shouldGroupMessages = (
  currentMessage,
  previousMessage,
  maxGapMinutes = 5,
) => {
  if (!previousMessage) return false;

  // Cùng người gửi
  const sameSender = currentMessage.sender === previousMessage.sender;

  // Thời gian gần nhau (mặc định 5 phút)
  const timeDiff = getTimeDifferenceInMinutes(
    currentMessage.timestamp,
    previousMessage.timestamp,
  );
  const withinTimeGap = timeDiff <= maxGapMinutes;

  return sameSender && withinTimeGap;
};

/**
 * Kiểm tra có phải session mới không (gap lớn hơn 30 phút hoặc khác ngày)
 */
export const isNewSession = (
  currentMessage,
  previousMessage,
  sessionGapMinutes = 30,
) => {
  if (!previousMessage) return true;

  const timeDiff = getTimeDifferenceInMinutes(
    currentMessage.timestamp,
    previousMessage.timestamp,
  );

  // Kiểm tra khác ngày
  const currentDate = new Date(currentMessage.timestamp).toDateString();
  const previousDate = new Date(previousMessage.timestamp).toDateString();
  const differentDay = currentDate !== previousDate;

  return timeDiff > sessionGapMinutes || differentDay;
};

/**
 * Tạo time separator text
 */
export const getTimeSeparator = (currentMessage, previousMessage) => {
  const currentDate = new Date(currentMessage.timestamp);
  const previousDate = previousMessage
    ? new Date(previousMessage.timestamp)
    : null;

  // Kiểm tra khác ngày
  if (
    !previousMessage ||
    currentDate.toDateString() !== previousDate.toDateString()
  ) {
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

  // Kiểm tra gap lớn trong cùng ngày (>2 tiếng)
  if (previousMessage) {
    const timeDiff = getTimeDifferenceInMinutes(
      currentMessage.timestamp,
      previousMessage.timestamp,
    );
    if (timeDiff > 120) {
      return currentDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
  }

  return null;
};

/**
 * Format timestamp cho hiển thị
 */
export const formatMessageTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Xử lý một mảng tin nhắn và thêm metadata để render
 */
export const processMessagesForRendering = (messages) => {
  if (!messages || !Array.isArray(messages)) return [];

  return messages.map((message, index) => {
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage =
      index < messages.length - 1 ? messages[index + 1] : null;

    // Kiểm tra grouping
    const isGrouped = shouldGroupMessages(message, previousMessage);
    const isFirstInGroup = !isGrouped;
    const isLastInGroup =
      !nextMessage || !shouldGroupMessages(nextMessage, message);

    // Kiểm tra session mới
    const isNewSessionStart = isNewSession(message, previousMessage);

    // Tạo time separator
    const timeSeparator = getTimeSeparator(message, previousMessage);

    return {
      ...message,
      // Metadata cho rendering
      isFirst: isFirstInGroup,
      isLast: isLastInGroup,
      isGrouped: isGrouped,
      isNewSession: isNewSessionStart,
      timeSeparator: timeSeparator,
      formattedTime: formatMessageTimestamp(message.timestamp),
    };
  });
};
