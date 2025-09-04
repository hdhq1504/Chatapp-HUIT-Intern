import { useState, useEffect, useCallback } from 'react';

export const useTyping = (chatId) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());

  let typingTimeout;

  const startTyping = useCallback(() => {
    setIsTyping(true);

    // In real app: emit typing event to server
    console.log(`User started typing in chat ${chatId}`);

    // Clear existing timeout
    clearTimeout(typingTimeout);

    // Stop typing after 3 seconds of inactivity
    typingTimeout = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [chatId]);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
    clearTimeout(typingTimeout);

    // In real app: emit stop typing event to server
    console.log(`User stopped typing in chat ${chatId}`);
  }, [chatId]);

  const addTypingUser = useCallback((userId, userName) => {
    setTypingUsers((prev) => new Set([...prev, { userId, userName }]));
  }, []);

  const removeTypingUser = useCallback((userId) => {
    setTypingUsers((prev) => {
      const newSet = new Set();
      prev.forEach((user) => {
        if (user.userId !== userId) {
          newSet.add(user);
        }
      });
      return newSet;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout);
    };
  }, []);

  const getTypingText = () => {
    const count = typingUsers.size;
    if (count === 0) return '';
    if (count === 1) {
      const user = Array.from(typingUsers)[0];
      return `${user.userName} is typing...`;
    }
    if (count === 2) {
      const users = Array.from(typingUsers);
      return `${users[0].userName} and ${users[1].userName} are typing...`;
    }
    return `${count} people are typing...`;
  };

  return {
    isTyping,
    typingUsers,
    startTyping,
    stopTyping,
    addTypingUser,
    removeTypingUser,
    getTypingText,
    hasTypingUsers: typingUsers.size > 0,
  };
};
