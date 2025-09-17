import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  connect(token) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        this.isConnected = true;
        this.subscribeToMessages();
      },
      onDisconnect: () => {
        this.isConnected = false;
      },
    });

    this.client.activate();
  }

  subscribeToMessages() {
    // Subscribe to direct messages
    this.client.subscribe('/user/queue/messages', (message) => {
      const data = JSON.parse(message.body);
      this.handleMessage(data);
    });

    // Subscribe to room messages
    this.client.subscribe('/topic/room/*', (message) => {
      const data = JSON.parse(message.body);
      this.handleRoomMessage(data);
    });
  }

  sendMessage(messageData) {
    if (this.isConnected) {
      this.client.publish({
        destination: '/app/sendMessage',
        body: JSON.stringify(messageData),
      });
    }
  }
}
