"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
    : "";

/**
 * Hook for real-time sales chat (admin ↔ team).
 * @param {string} userId - Current user id (admin.id or employee._id)
 * @param {object} options - { onNewMessage, onMessagesRead }
 * @returns { { connected, emitNewMessage, emitMarkRead } }
 */
export function useSalesChatSocket(userId, options = {}) {
  const { onNewMessage, onMessagesRead } = options;
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const onNewMessageRef = useRef(onNewMessage);
  const onMessagesReadRef = useRef(onMessagesRead);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onMessagesReadRef.current = onMessagesRead;
  }, [onNewMessage, onMessagesRead]);

  useEffect(() => {
    if (!userId || !SOCKET_URL) return;

    const socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", { userId });
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on("new_message", (message) => {
      if (onNewMessageRef.current) onNewMessageRef.current(message);
    });

    socket.on("messages_read", (payload) => {
      if (onMessagesReadRef.current) onMessagesReadRef.current(payload);
    });

    return () => {
      socket.off("new_message");
      socket.off("messages_read");
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [userId]);

  const emitNewMessage = useCallback((toUserId, message) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("send_message", { toUserId, message });
    }
  }, []);

  const emitMarkRead = useCallback((readByUserId, withUserId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("mark_read", {
        readBy: readByUserId,
        withUserId,
      });
    }
  }, []);

  return { connected, emitNewMessage, emitMarkRead };
}
