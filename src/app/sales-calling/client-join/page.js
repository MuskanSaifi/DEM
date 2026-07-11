"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";

const SOCKET_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
    : "";

const ICE = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

function ClientCallInner() {
  const sp = useSearchParams();
  const roomId = sp.get("roomId");
  const clientName = sp.get("name") || "Client";
  const clientId = roomId ? `client-${roomId}` : null;

  const [status, setStatus] = useState("Connecting…");
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const agentIdRef = useRef(null);

  useEffect(() => {
    if (!roomId || !clientId || !SOCKET_URL) {
      setStatus("Invalid call link");
      return;
    }

    const socket = io(`${SOCKET_URL}/dem-calling`, { autoConnect: true, reconnection: true });
    socketRef.current = socket;

    socket.on("connect", async () => {
      socket.emit("join", { userId: clientId, role: "calling-client" });
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;
        socket.emit("client_join_call", { roomId, clientName });
        setStatus("Agent se connect ho raha hai…");
      } catch {
        setStatus("Microphone allow karein");
      }
    });

    socket.on("client_call_offer", async ({ offer, from, roomId: rid }) => {
      if (rid !== roomId || !streamRef.current || !offer) return;
      agentIdRef.current = from;

      const pc = new RTCPeerConnection(ICE);
      peerRef.current = pc;
      streamRef.current.getTracks().forEach((t) => pc.addTrack(t, streamRef.current));

      pc.onicecandidate = (e) => {
        if (e.candidate && agentIdRef.current) {
          socket.emit("client_call_ice", {
            roomId,
            candidate: e.candidate,
            to: agentIdRef.current,
            from: clientId,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("client_call_answer", {
        roomId,
        answer,
        to: from,
        from: clientId,
      });
      setStatus("✅ Connected — ab agent se baat karein (Internet Call)");
    });

    socket.on("client_call_ice", async ({ candidate, roomId: rid }) => {
      if (rid === roomId && peerRef.current && candidate) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          /* ignore */
        }
      }
    });

    socket.on("call_ended", () => setStatus("Call khatam ho gayi"));

    return () => {
      peerRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      socket.disconnect();
    };
  }, [roomId, clientId, clientName]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", textAlign: "center", maxWidth: 400, margin: "40px auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#4F46E5" }}>📞 DEM Internet Call</h1>
      <p style={{ marginTop: 16, fontSize: 16, color: "#374151" }}>{status}</p>
      <p style={{ marginTop: 12, fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
        Ye call phone network nahi — internet par hai. Admin dono ki awaaz bina speaker ke sun sakta hai.
      </p>
    </div>
  );
}

export default function ClientJoinPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <ClientCallInner />
    </Suspense>
  );
}
