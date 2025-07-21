import { createContext, useContext, useEffect, useState } from "react";
import useWebSocket, { ReadyState, SendMessage } from "react-use-websocket";
import { authClient } from "./Auth";

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
  const { data } = authClient.useSession();
  const [token, setToken] = useState(data?.session.token);

  useEffect(() => {
    if (data?.session.token) {
      setToken(data.session.token);
    }
  }, [data?.session.token]);

  const url = import.meta.env.VITE_API_URL || "ws://localhost:3000";

  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket<WSMessage>(
      url,
      {
        queryParams: { token: token! },
        shouldReconnect: () => true,
        reconnectInterval: 3000,
        share: true,
        onOpen: () => console.log("WebSocket connected"),
        onClose: () => console.log("WebSocket disconnected"),
        onError: (e) => console.error("WebSocket error", e),
      },
      Boolean(data && token),
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
