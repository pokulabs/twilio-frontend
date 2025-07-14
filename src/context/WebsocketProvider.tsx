import { createContext, useContext, useMemo } from "react";
import useWebSocket, { ReadyState, SendMessage } from "react-use-websocket";
import { useAuth } from "react-oidc-context";

type WSMessage = { type: string; payload: any };

interface WebSocketContextValue {
  sendJsonMessage: SendMessage;
  lastJsonMessage: WSMessage | null;
  readyState: ReadyState;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(
  undefined,
);

export const WebsocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isAuthenticated } = useAuth();

  const token = user?.access_token;

  const url = useMemo(() => {
    const base = import.meta.env.VITE_API_URL || "ws://localhost:3000";
    return token ? `${base}?token=${encodeURIComponent(token)}` : null;
  }, [token]);

  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket<WSMessage>(
      url,
      {
        shouldReconnect: () => true,
        reconnectInterval: 3000,
        share: true,
        onOpen: () => console.log("WebSocket connected"),
        onClose: () => console.log("WebSocket disconnected"),
        onError: (e) => console.error("WebSocket error", e),
      },
      Boolean(isAuthenticated && token),
    );

  return (
    <WebSocketContext.Provider
      value={{ sendJsonMessage, lastJsonMessage, readyState }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebsocketContext() {
  const ctx = useContext(WebSocketContext);
  if (!ctx)
    throw new Error(
      "useWebSocketContext must be used within WebSocketProvider",
    );
  return ctx;
}
