"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCallingSocket } from "@/lib/dem-calling/useCallingSocket";

function AgentStreamInner() {
  const sp = useSearchParams();
  const userId = sp.get("userId");
  const roomId = sp.get("roomId");
  const callId = sp.get("callId");
  const agentName = sp.get("agentName") || "Agent";
  const clientName = sp.get("clientName") || "Client";
  const clientMobile = sp.get("clientMobile") || "";

  const [status, setStatus] = useState("Socket connect…");
  const { connected, startAgentCall } = useCallingSocket("sales-employee", userId);

  useEffect(() => {
    if (!userId || !roomId || !callId) {
      setStatus("Missing parameters");
      return;
    }
    if (!connected) {
      const t = setTimeout(() => setStatus("Socket fail — npm run socket"), 10000);
      return () => clearTimeout(t);
    }

    const call = { _id: callId, roomId, agentName, clientName, clientMobile, agentId: userId };

    (async () => {
      try {
        setStatus("Mic allow karein…");
        await startAgentCall(call);
        setStatus("live");
      } catch (e) {
        setStatus(`Mic error: ${e.message || "denied"}`);
      }
    })();
  }, [userId, roomId, callId, connected, startAgentCall, agentName, clientName, clientMobile]);

  if (status !== "live") {
    return <div style={{ padding: 12, fontSize: 12, color: "#6B7280" }}>{status}</div>;
  }

  return (
    <div style={{ padding: 12, fontFamily: "system-ui", fontSize: 13 }}>
        <p style={{ color: "#059669", fontWeight: 700 }}>🎤 Agent mic LIVE</p>
        <p style={{ color: "#059669", marginTop: 6 }}>Admin sun sakta hai — mic allow rakhein</p>
      {clientMobile && <p style={{ fontSize: 11, color: "#6B7280", marginTop: 6 }}>Client: {clientMobile}</p>}
    </div>
  );
}

export default function AgentStreamPage() {
  return (
    <Suspense fallback={<div style={{ padding: 12 }}>Loading…</div>}>
      <AgentStreamInner />
    </Suspense>
  );
}
