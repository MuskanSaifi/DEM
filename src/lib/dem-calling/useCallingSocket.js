"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io } from "socket.io-client";
import { mixAudioStreams } from "./audioMix";
import { resolveCallingSocketUrl } from "./socketUrl";
import { startAgentAudioRelay, createAdminAudioPlayer, attachMonitorStream } from "./audioRelay";

const ICE = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export function useCallingSocket(role, userId, socketUrlOverride) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [activeCalls, setActiveCalls] = useState([]);
  const [clientOnCall, setClientOnCall] = useState(false);
  const peerRef = useRef(null);
  const clientPeerRef = useRef(null);
  const localStreamRef = useRef(null);
  const clientStreamRef = useRef(null);
  const monitorAudioRef = useRef(null);
  const monitorVideoRef = useRef(null);
  const activeCallRef = useRef(null);
  const agentRelayStopRef = useRef(null);
  const adminPlayerRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socketUrl = resolveCallingSocketUrl(socketUrlOverride);
    if (!socketUrl) return;

    const socket = io(`${socketUrl}/dem-calling`, {
      autoConnect: true,
      reconnection: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", { userId, role });
      if (role === "sales-admin" || role === "calling-admin") {
        socket.emit("get_active_calls");
      }
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("active_calls", (calls) => setActiveCalls(calls || []));
    socket.on("call_started", (call) => {
      setActiveCalls((prev) => {
        if (prev.some((c) => c.roomId === call.roomId)) return prev;
        return [call, ...prev];
      });
    });
    socket.on("call_ended", ({ roomId }) => {
      setActiveCalls((prev) => prev.filter((c) => c.roomId !== roomId));
      setClientOnCall(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [userId, role, socketUrlOverride]);

  const cleanupPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (clientPeerRef.current) {
      clientPeerRef.current.close();
      clientPeerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    clientStreamRef.current = null;
    setClientOnCall(false);
    if (monitorAudioRef.current) {
      monitorAudioRef.current.srcObject = null;
    }
    if (monitorVideoRef.current) {
      monitorVideoRef.current.srcObject = null;
    }
    if (agentRelayStopRef.current) {
      agentRelayStopRef.current();
      agentRelayStopRef.current = null;
    }
    if (adminPlayerRef.current) {
      adminPlayerRef.current.stop();
      adminPlayerRef.current = null;
    }
  }, []);

  const getMonitorStream = useCallback(() => {
    const streams = [localStreamRef.current, clientStreamRef.current].filter(Boolean);
    return mixAudioStreams(streams) || localStreamRef.current;
  }, []);

  const connectToClient = useCallback(
    async (call, clientId) => {
      if (!socketRef.current || !localStreamRef.current) return;
      if (clientPeerRef.current) {
        clientPeerRef.current.close();
        clientPeerRef.current = null;
      }

      const pc = new RTCPeerConnection(ICE);
      clientPeerRef.current = pc;
      const stream = localStreamRef.current;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        if (e.streams[0]) {
          clientStreamRef.current = e.streams[0];
          setClientOnCall(true);
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current.emit("client_call_ice", {
            roomId: call.roomId,
            candidate: e.candidate,
            to: clientId,
            from: userId,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit("client_call_offer", {
        roomId: call.roomId,
        offer,
        to: clientId,
        from: userId,
      });
    },
    [userId]
  );

  const startAgentCall = useCallback(
    async (call) => {
      if (!socketRef.current || role !== "sales-employee") return;

      cleanupPeer();
      activeCallRef.current = call;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      localStreamRef.current = stream;

      socketRef.current.emit("agent_join_call", {
        roomId: call.roomId,
        callId: call._id,
        agentId: userId,
        agentName: call.agentName || "",
        clientName: call.clientName || "Client",
        clientMobile: call.clientMobile || "",
      });

      const sock = socketRef.current;

      sock.off("client_joined_call");
      sock.on("client_joined_call", async ({ roomId, clientId }) => {
        if (roomId !== call.roomId) return;
        await connectToClient(call, clientId || `client-${roomId}`);
      });

      sock.off("client_call_answer");
      sock.on("client_call_answer", async ({ answer, roomId }) => {
        if (roomId !== call.roomId || !clientPeerRef.current) return;
        await clientPeerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      });

      sock.off("client_call_ice");
      sock.on("client_call_ice", async ({ candidate, roomId }) => {
        if (roomId !== call.roomId || !clientPeerRef.current || !candidate) return;
        try {
          await clientPeerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          /* ignore */
        }
      });

      sock.off("admin_wants_monitor");
      sock.on("admin_wants_monitor", async ({ adminId, roomId }) => {
        if (roomId !== call.roomId) return;

        const monitorStream = localStreamRef.current || getMonitorStream();
        if (!monitorStream) return;

        if (agentRelayStopRef.current) agentRelayStopRef.current();
        agentRelayStopRef.current = startAgentAudioRelay(sock, monitorStream, call.roomId, adminId);

        if (peerRef.current) {
          peerRef.current.close();
          peerRef.current = null;
        }

        const pc = new RTCPeerConnection(ICE);
        peerRef.current = pc;
        monitorStream.getTracks().forEach((track) => pc.addTrack(track, monitorStream));

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            sock.emit("monitor_ice", {
              roomId: call.roomId,
              candidate: e.candidate,
              to: adminId,
              from: userId,
            });
          }
        };

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sock.emit("monitor_offer", {
            roomId: call.roomId,
            offer,
            to: adminId,
            from: userId,
          });
        } catch {
          /* WebRTC fail — socket relay chalega */
        }
      });

      sock.off("monitor_answer");
      sock.on("monitor_answer", async ({ answer, roomId }) => {
        if (peerRef.current && (!roomId || roomId === call.roomId)) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      sock.off("monitor_ice");
      sock.on("monitor_ice", async ({ candidate, roomId }) => {
        if (peerRef.current && candidate && (!roomId || roomId === call.roomId)) {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {
            /* ignore */
          }
        }
      });
    },
    [role, userId, cleanupPeer, connectToClient, getMonitorStream]
  );

  const listenToCall = useCallback(
    (call) => {
      const isAdmin = role === "sales-admin" || role === "calling-admin";
      if (!socketRef.current || !isAdmin) {
        return Promise.reject(new Error("Socket not ready"));
      }

      cleanupPeer();

      return new Promise((resolve, reject) => {
        const pc = new RTCPeerConnection(ICE);
        peerRef.current = pc;
        let settled = false;
        let retryTimer = null;

        const done = (mode) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          if (retryTimer) clearInterval(retryTimer);
          resolve({ mode });
        };

        const fail = (msg) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          if (retryTimer) clearInterval(retryTimer);
          reject(new Error(msg));
        };

        const timeout = setTimeout(() => {
          fail("Agent audio nahi aayi — agent mic allow + call active check karein");
        }, 25000);

        pc.ontrack = (event) => {
          if (event.streams[0]) {
            attachMonitorStream(event.streams[0], monitorVideoRef, monitorAudioRef)?.catch(() => {});
            done("webrtc");
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socketRef.current.emit("monitor_ice", {
              roomId: call.roomId,
              candidate: e.candidate,
              to: call.agentId,
              from: userId,
            });
          }
        };

        const sock = socketRef.current;
        if (!adminPlayerRef.current) adminPlayerRef.current = createAdminAudioPlayer();

        sock.off("monitor_audio_chunk");
        sock.on("monitor_audio_chunk", (payload) => {
          if (payload.roomId !== call.roomId) return;
          if (String(payload.adminId) !== String(userId)) return;
          try {
            adminPlayerRef.current.playChunk(payload);
            done("relay");
          } catch {
            /* ignore */
          }
        });

        sock.off("monitor_offer");
        sock.on("monitor_offer", async ({ offer, from, roomId }) => {
          if (roomId && roomId !== call.roomId) return;
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sock.emit("monitor_answer", {
              roomId: call.roomId,
              answer,
              to: from,
              from: userId,
            });
          } catch (err) {
            console.error("monitor answer error", err);
          }
        });

        sock.off("monitor_ice");
        sock.on("monitor_ice", async ({ candidate, roomId }) => {
          if (candidate && (!roomId || roomId === call.roomId)) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch {
              /* ignore */
            }
          }
        });

        const requestListen = () => {
          sock.emit("admin_listen", {
            roomId: call.roomId,
            adminId: userId,
            agentId: String(call.agentId),
          });
        };

        requestListen();
        retryTimer = setInterval(requestListen, 4000);
      });
    },
    [role, userId, cleanupPeer]
  );

  const endAgentCall = useCallback(
    (roomId) => {
      cleanupPeer();
      socketRef.current?.emit("agent_end_call", { roomId, agentId: userId });
    },
    [userId, cleanupPeer]
  );

  return {
    connected,
    activeCalls,
    clientOnCall,
    startAgentCall,
    listenToCall,
    endAgentCall,
    cleanupPeer,
    monitorAudioRef,
    monitorVideoRef,
    adminPlayerRef,
  };
}
