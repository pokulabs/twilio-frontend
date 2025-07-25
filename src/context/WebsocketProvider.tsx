import { createContext, useContext } from "react";
import useWebSocket, { ReadyState, SendMessage } from "react-use-websocket";
import { useAuth } from "../hooks/use-auth";

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
  const { isAuthenticated } = useAuth();

  /**
   * Old code for authenticating via token in query params
   */
  // const [token, setToken] = useState(token);
  // useEffect(() => {
  //   if (token) {
  //     setToken(data.session.token);
  //   }
  // }, [token]);

  const url = import.meta.env.VITE_API_URL || "ws://localhost:3000";

  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket<WSMessage>(
      url,
      {
        // queryParams: { token: token! },
        shouldReconnect: () => true,
        reconnectInterval: 3000,
        share: true,
        onOpen: () => console.log("WebSocket connected"),
        onClose: () => console.log("WebSocket disconnected"),
        onError: (e) => console.error("WebSocket error", e),
      },
      isAuthenticated,
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
