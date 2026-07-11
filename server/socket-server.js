/**
 * Standalone Socket.io server for Sales Admin ↔ Sales Team real-time chat
 * + DEM Calling silent monitor (WebRTC signaling).
 * Run: npm run socket
 */
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.SOCKET_PORT || 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN
      ? process.env.SOCKET_CORS_ORIGIN.split(",")
      : true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// --- Sales Chat (unchanged) ---
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
    if (currentUserId) leaveUserRoom(currentUserId, socket.id);
  });

  socket.on("send_message", (payload) => {
    const toUserId = payload?.toUserId ? String(payload.toUserId) : null;
    const message = payload?.message;
    if (!toUserId || !message) return;
    io.to(`user-${toUserId}`).emit("new_message", message);
  });

  socket.on("mark_read", (payload) => {
    const readByUserId = payload?.readBy ? String(payload.readBy) : null;
    const withUserId = payload?.withUserId ? String(payload.withUserId) : null;
    if (!readByUserId || !withUserId) return;
    io.to(`user-${withUserId}`).emit("messages_read", { readBy: readByUserId });
  });
});

// --- DEM Calling namespace (silent monitor signaling) ---
const callingNs = io.of("/dem-calling");
const activeCallRooms = new Map();

callingNs.on("connection", (socket) => {
  let userId = null;
  let role = null;

  socket.on("join", (payload) => {
    userId = payload?.userId ? String(payload.userId) : null;
    role = payload?.role || null;
    if (!userId) return;

    socket.join(`calling-user-${userId}`);
    const isAdmin = role === "sales-admin" || role === "calling-admin";
    const isAgent = role === "sales-employee" || role === "calling-agent";
    if (isAdmin) {
      socket.join("calling-admins");
    }
    if (isAgent) {
      socket.join("calling-agents");
    }
  });

  socket.on("get_active_calls", () => {
    const calls = [...activeCallRooms.values()];
    socket.emit("active_calls", calls);
  });

  socket.on("agent_join_call", (payload) => {
    const { roomId, callId, agentId, agentName, clientName, clientMobile } =
      payload || {};
    if (!roomId) return;

    socket.join(`call-${roomId}`);
    const callMeta = {
      _id: callId,
      roomId,
      agentId: String(agentId),
      agentName: agentName || "",
      clientName: clientName || "Client",
      clientMobile: clientMobile || "",
      startedAt: new Date().toISOString(),
    };
    activeCallRooms.set(roomId, callMeta);
    callingNs.to("calling-admins").emit("call_started", callMeta);
    callingNs.to("calling-admins").emit("active_calls", [...activeCallRooms.values()]);
  });

  socket.on("admin_listen", (payload) => {
    const { roomId, adminId, agentId } = payload || {};
    if (!roomId || !adminId || !agentId) return;

    socket.join(`call-${roomId}`);
    callingNs.to(`calling-user-${agentId}`).emit("admin_wants_monitor", {
      adminId: String(adminId),
      roomId,
    });
  });

  socket.on("monitor_audio_chunk", (payload) => {
    const { adminId, roomId, data, sampleRate } = payload || {};
    if (!adminId || !data) return;
    callingNs.to(`calling-user-${adminId}`).emit("monitor_audio_chunk", {
      roomId,
      adminId: String(adminId),
      data,
      sampleRate,
    });
  });

  socket.on("monitor_offer", (payload) => {
    const { to, offer, roomId } = payload || {};
    if (!to || !offer) return;
    callingNs.to(`calling-user-${to}`).emit("monitor_offer", {
      offer,
      from: userId,
      roomId,
    });
  });

  socket.on("monitor_answer", (payload) => {
    const { to, answer, roomId } = payload || {};
    if (!to || !answer) return;
    callingNs.to(`calling-user-${to}`).emit("monitor_answer", {
      answer,
      from: userId,
      roomId,
    });
  });

  socket.on("monitor_ice", (payload) => {
    const { to, candidate, roomId } = payload || {};
    if (!to || !candidate) return;
    callingNs.to(`calling-user-${to}`).emit("monitor_ice", {
      candidate,
      from: userId,
      roomId,
    });
  });

  // --- Client internet call (browser link — no speaker needed) ---
  socket.on("client_join_call", (payload) => {
    const { roomId, clientName } = payload || {};
    if (!roomId) return;
    socket.join(`call-${roomId}`);
    const callMeta = activeCallRooms.get(roomId);
    if (!callMeta) return;
    callingNs.to(`calling-user-${callMeta.agentId}`).emit("client_joined_call", {
      roomId,
      clientName: clientName || "Client",
      clientId: `client-${roomId}`,
    });
  });

  socket.on("client_call_offer", (payload) => {
    const { to, offer, roomId } = payload || {};
    if (!to || !offer) return;
    callingNs.to(`calling-user-${to}`).emit("client_call_offer", {
      offer,
      from: userId,
      roomId,
    });
  });

  socket.on("client_call_answer", (payload) => {
    const { to, answer, roomId } = payload || {};
    if (!to || !answer) return;
    callingNs.to(`calling-user-${to}`).emit("client_call_answer", {
      answer,
      from: userId,
      roomId,
    });
  });

  socket.on("client_call_ice", (payload) => {
    const { to, candidate, roomId } = payload || {};
    if (!to || !candidate) return;
    callingNs.to(`calling-user-${to}`).emit("client_call_ice", {
      candidate,
      from: userId,
      roomId,
    });
  });

  socket.on("agent_end_call", (payload) => {
    const { roomId } = payload || {};
    if (!roomId) return;
    activeCallRooms.delete(roomId);
    callingNs.to(`call-${roomId}`).emit("call_ended", { roomId });
    callingNs.to("calling-admins").emit("call_ended", { roomId });
    callingNs.to("calling-admins").emit("active_calls", [...activeCallRooms.values()]);
  });

  socket.on("disconnect", () => {
    // rooms cleaned automatically by socket.io
  });
});

httpServer.listen(PORT, () => {
  console.log(`[Socket] Sales Chat + DEM Calling on port ${PORT}`);
});
