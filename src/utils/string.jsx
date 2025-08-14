import Photo1 from "../assets/images/photo_2025_1.png";
import Photo2 from "../assets/images/photo_2025_2.png";

export const messages = {
  1: [
    {
      id: 1,
      senderId: 1,
      senderName: "Maria Nelson",
      message: Photo1,
      timestamp: "2025-03-20T10:30:00Z",
      isMe: false,
    },
    {
      id: 2,
      senderId: "me",
      senderName: "Quân Hồ",
      message: "Hi Maria! I'm doing great, thanks for asking 😊",
      timestamp: "2025-03-20T10:32:00Z",
      isMe: true,
    },
    {
      id: 3,
      senderId: 1,
      senderName: "Maria Nelson",
      message: "That's wonderful to hear!",
      timestamp: "2025-03-20T10:33:00Z",
      isMe: false,
    },
    {
      id: 4,
      senderId: 1,
      senderName: "Maria Nelson",
      message: "Are you free for lunch tomorrow?",
      timestamp: "2025-03-20T10:35:00Z",
      isMe: false,
    },
    {
      id: 5,
      senderId: "me",
      senderName: "Quân Hồ",
      message: "Sure! What time works for you?",
      timestamp: "2025-03-20T10:37:00Z",
      isMe: true,
    },
    {
      id: 6,
      senderId: 1,
      senderName: "Maria Nelson",
      message: "looks good",
      timestamp: "2025-03-20T14:30:00Z",
      isMe: false,
    },
    {
      id: 7,
      senderId: "me",
      senderName: "Maria Nelson",
      message: Photo2,
      timestamp: "2025-03-20T14:30:00Z",
      isMe: true,
    },
  ],
};

export function getInitial(name = "") {
  return name?.trim()?.charAt(0)?.toUpperCase() || "";
}

export const getMessagesByUserId = (userId) => {
  return messages[userId] || [];
};
