import { useEffect } from "react";
import { toast } from "sonner";

export function useNotifications() {
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host.replace("3000", "8000")}/ws/notifications/`;
    
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        toast.info(data.message, {
          description: "System Notification",
          duration: 5000,
        });
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);
}
