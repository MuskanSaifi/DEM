/**
 * Standalone Socket.io server for Sales Admin ↔ Sales Team real-time chat.
 * Run: npm run socket (or node server/socket-server.js)
 * Default port: 3001. Set SOCKET_PORT in .env to override.
 */
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.SOCKET_PORT || 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// userId -> Set of socket ids (user can have multiple tabs)
const userSockets = new Map();

function joinUserRoom(userId, socketId) {
  if (!userId) return;
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socketId);
}

function leaveUserRoom(userId, socketId) {
  if (!userId) return;
  const set = userSockets.get(userId);
  if (set) {
    set.delete(socketId);
    if (set.size === 0) userSockets.delete(userId);
  }
}

function getSocketIdsForUser(userId) {
  return userSockets.get(userId) ? [...userSockets.get(userId)] : [];
}

io.on("connection", (socket) => {
  let currentUserId = null;

  socket.on("join", (payload) => {
    const userId = payload?.userId ? String(payload.userId) : null;
    if (!userId) return;
    currentUserId = userId;
    socket.join(`user-${userId}`);
    joinUserRoom(userId, socket.id);
  });

  socket.on("disconnect", () => {
    if (currentUserId) {
      leaveUserRoom(currentUserId, socket.id);
    }
  });

  // Client sends after saving message via API; we forward to recipient for real-time delivery
  socket.on("send_message", (payload) => {
    const toUserId = payload?.toUserId ? String(payload.toUserId) : null;
    const message = payload?.message;
    if (!toUserId || !message) return;
    io.to(`user-${toUserId}`).emit("new_message", message);
  });

  // When user opens a conversation, they mark messages as read via API then notify the other side
  socket.on("mark_read", (payload) => {
    const readByUserId = payload?.readBy ? String(payload.readBy) : null;
    const withUserId = payload?.withUserId ? String(payload.withUserId) : null;
    if (!readByUserId || !withUserId) return;
    io.to(`user-${withUserId}`).emit("messages_read", { readBy: readByUserId });
  });
});

httpServer.listen(PORT, () => {
  console.log(`[Sales Chat] Socket.io server running on port ${PORT}`);
});
