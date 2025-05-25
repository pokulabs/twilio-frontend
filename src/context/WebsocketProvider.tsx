import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

type WebSocketContextType = {
  socket: WebSocket | null;
  isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    disconnect();

    if (!isAuthenticated || !token) {
      // No auth, skipping connection
      return;
    }

    const url = new URL(import.meta.env.VITE_API_URL || "ws://localhost:3000");
    url.searchParams.set("token", token);

    const ws = new WebSocket(url.toString());
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    // Can add global onMessage handling if needed
    // ws.onmessage = (event) => {};

    ws.onclose = (event) => {
      console.warn("WebSocket closed", event.code, event.reason);
      setIsConnected(false);
      socketRef.current = null;
      scheduleReconnect();
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
      ws.close();
    };
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) return; // already scheduled

    console.log("Scheduling WebSocket reconnect in 3 seconds...");
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      if (isAuthenticated && token) {
        connect();
      } else {
        console.log("Skipping reconnect: not authenticated");
      }
    }, 3000);
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [token, isAuthenticated]);

  return (
    <WebSocketContext.Provider
      value={{ socket: socketRef.current, isConnected }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
