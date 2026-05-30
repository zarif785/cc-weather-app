import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useCityStore } from '../store/cityStore';

interface IncomingMessage {
  city: string;
  country: string;
  message: string;
  username: string;
  timestamp: string;
}

export function useSocket() {
  const city = useCityStore((s) => s.city);
  const country = useCityStore((s) => s.country);
  const socketRef = useRef<Socket | null>(null);

  // Connect once, listen for incoming messages.
  useEffect(() => {
    const socket = io({ withCredentials: true });
    socketRef.current = socket;

    socket.on('message', (msg: IncomingMessage) => {
      toast.custom((t) => (
        <div
          className={`pointer-events-auto max-w-sm border border-ink bg-paper px-5 py-4 shadow-md transition-opacity duration-300 ${
            t.visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-ink-soft">
            Dispatch · {msg.city}, {msg.country}
          </p>
          <p className="mt-1 font-display text-lg italic text-ink">{msg.message}</p>
          <p className="mt-1 text-xs text-ink-soft">— {msg.username}</p>
        </div>
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join the room for the selected city whenever it changes.
  useEffect(() => {
    if (city && country && socketRef.current) {
      socketRef.current.emit('join-city', { city, country });
    }
  }, [city, country]);
}
