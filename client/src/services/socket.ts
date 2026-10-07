import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('teamflow_token');
    socket = io(window.location.origin, {
      auth: { token },
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO real-time server');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });
  } else if (!socket.connected) {
    const token = localStorage.getItem('teamflow_token');
    socket.auth = { token };
    socket.connect();
  }
  return socket;
}

export function joinProjectRoom(projectId: string) {
  const s = getSocket();
  s.emit('join:project', projectId);
}

export function leaveProjectRoom(projectId: string) {
  if (socket) {
    socket.emit('leave:project', projectId);
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
