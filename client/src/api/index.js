import { apiService } from './apiService';
import { mockApiService } from './mockApiService';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.MODE === 'development';

export const api = USE_MOCK_API ? mockApiService : apiService;

export const ApiResponseTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
};

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const setupApiInterceptors = (getToken, clearAuth, refreshTokenFn) => {
  const originalRequest = api.request;

  api.request = async (endpoint, options = {}) => {
    const token = getToken();
    if (token) {
      api.setToken(token);
    }

    try {
      return await originalRequest.call(api, endpoint, options);
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        try {
          const newTokens = await refreshTokenFn();
          api.setToken(newTokens.token);

          return await originalRequest.call(api, endpoint, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newTokens.token}`,
            },
          });
        } catch (refreshError) {
          clearAuth();
          throw refreshError;
        }
      }
      throw error;
    }
  };
};

export const handleApiResponse = (response) => {
  if (response.success) {
    return response.data;
  }
  throw new ApiError(response.message || 'API Error', response.status, response.data);
};

export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      data: error.data,
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    status: 500,
    data: null,
  };
};

export const setupRealtimeConnection = (userId, onMessage, onUserStatus) => {
  if (USE_MOCK_API) {
    console.log('Mock real-time connection established for user:', userId);

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        onUserStatus?.({
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          status: Math.random() > 0.5 ? 'online' : 'offline',
        });
      }
    }, 5000);

    return {
      disconnect: () => {
        clearInterval(interval);
        console.log('Mock real-time connection disconnected');
      },
      emit: (event, data) => {
        console.log('Mock emit:', event, data);
      },
    };
  }

  const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws?userId=${userId}`);

  ws.onopen = () => {
    console.log('Real-time connection established');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'message':
          onMessage?.(data.payload);
          break;
        case 'user_status':
          onUserStatus?.(data.payload);
          break;
        default:
          console.log('Unknown real-time event:', data);
      }
    } catch (error) {
      console.error('Error parsing real-time message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('Real-time connection closed');
  };

  return {
    disconnect: () => {
      ws.close();
    },
    emit: (event, data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: event, payload: data }));
      }
    },
  };
};

export default api;