"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCallingSocket } from "@/lib/dem-calling/useCallingSocket";
import { resolveCallingSocketUrl } from "@/lib/dem-calling/socketUrl";
import { playMonitorMedia } from "@/lib/dem-calling/audioRelay";

function AdminListenInner() {
  const sp = useSearchParams();
  const adminId = sp.get("adminId");
  const roomId = sp.get("roomId");
  const agentId = sp.get("agentId");
  const callId = sp.get("callId");
  const token = sp.get("token");
  const socketOverride = sp.get("socketUrl");

  const [status, setStatus] = useState("Socket connect ho raha hai…");
  const [audioMode, setAudioMode] = useState("");
  const [socketHint, setSocketHint] = useState("");
  const started = useRef(false);

  const { connected, listenToCall, cleanupPeer, monitorAudioRef, monitorVideoRef, adminPlayerRef } =
    useCallingSocket("sales-admin", adminId, socketOverride);

  useEffect(() => {
    const url = resolveCallingSocketUrl(socketOverride);
    setSocketHint(url);
    if (!connected) {
      const t = setTimeout(() => {
        setStatus(`Socket fail ✗ — PC par "npm run socket" chalao`);
      }, 10000);
      return () => clearTimeout(t);
    }
    if (!started.current) setStatus("Socket OK ✓ — agent se audio wait…");
  }, [connected, socketOverride]);

  useEffect(() => {
    if (!adminId || !roomId || !agentId || !callId || started.current) return;
    if (!connected) return;

    started.current = true;

    (async () => {
      try {
        if (token) {
          const res = await fetch(`/api/dem-calling/calls/${callId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: "monitor" }),
          });
          const data = await res.json();
          if (!data.success) {
            setStatus(data.message || "Monitor API failed");
            return;
          }
        }

        setStatus("Agent mic connect ho raha hai…");
        const result = await listenToCall({ _id: callId, roomId, agentId });
        setAudioMode(result?.mode || "relay");
        setStatus("listening");
      } catch (e) {
        setStatus(e.message || "Listen failed");
      }
    })();

    return () => cleanupPeer();
  }, [adminId, roomId, agentId, callId, connected, listenToCall, token, cleanupPeer]);

  const playAudio = () => {
    adminPlayerRef.current?.resume();
    playMonitorMedia(monitorVideoRef, monitorAudioRef).catch(() => {});
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__demPlayMonitor = playAudio;
    }
    return () => {
      if (typeof window !== "undefined") delete window.__demPlayMonitor;
    };
  });

  return (
    <div style={{ padding: 16, fontFamily: "system-ui", minHeight: "100vh", background: "#F9FAFB" }}>
      <video ref={monitorVideoRef} autoPlay playsInline muted={false} style={{ width: 1, height: 1, position: "absolute", opacity: 0 }} />
      <audio ref={monitorAudioRef} autoPlay playsInline />

      {status === "listening" ? (
        <>
          <p style={{ color: "#059669", fontWeight: 800, fontSize: 18 }}>👂 Listening live…</p>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 6 }}>
            Mode: {audioMode === "webrtc" ? "Direct" : "Relay (PC se)"} · Agent speaker ON rakhe
          </p>
          <button
            type="button"
            onClick={playAudio}
            style={{
              marginTop: 16,
              padding: "16px 24px",
              background: "#4F46E5",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 17,
              width: "100%",
            }}
          >
            🔊 TAP — Audio ON karein
          </button>
          <p style={{ fontSize: 12, color: "#DC2626", marginTop: 10, textAlign: "center" }}>
            Awaaz nahi? Upar button zaroor dabayein
          </p>
        </>
      ) : (
        <>
          <p style={{ fontSize: 15, color: "#374151", fontWeight: 600 }}>{status}</p>
          {socketHint && (
            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 12, wordBreak: "break-all" }}>
              Socket: {socketHint}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminListenPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <AdminListenInner />
    </Suspense>
  );
}
