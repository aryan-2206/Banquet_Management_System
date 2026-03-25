import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

/**
 * useSocket — connects to a Socket.IO namespace and manages cleanup
 * @param {string} namespace - e.g. '/dj' or '/kitchen'
 * @param {(socket: import('socket.io-client').Socket) => Function} setup - callback to attach listeners, returns cleanup fn
 */
export default function useSocket(namespace, setup) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(`${SOCKET_SERVER}${namespace}`, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    const cleanup = setup ? setup(socketRef.current) : null;

    return () => {
      if (cleanup) cleanup();
      socketRef.current?.disconnect();
    };
  }, [namespace]);

  return socketRef;
}
