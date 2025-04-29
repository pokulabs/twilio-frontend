import { useEffect } from "react";
import { useWebSocket } from "../context/WebsocketProvider";

export function useWebSocketEvent(
    eventName: string,
    callback: (data: any) => void,
) {
    const { socket } = useWebSocket();

    useEffect(() => {
        if (!socket) return;

        const handler = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === eventName) {
                    callback(data.payload);
                }
            } catch (err) {
                console.error("Invalid WebSocket message format", err);
            }
        };

        socket.addEventListener("message", handler);
        return () => {
            socket.removeEventListener("message", handler);
        };
    }, [socket, eventName, callback]);
}
