"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

function AgentCallInner() {
  const sp = useSearchParams();
  const roomId = sp.get("roomId");
  const callId = sp.get("callId");
  const token = sp.get("token");
  const clientName = sp.get("clientName") || "Client";
  const clientMobile = sp.get("clientMobile") || "";

  const [status, setStatus] = useState("Loading…");
  const [sdkReady, setSdkReady] = useState(false);
  const deviceRef = useRef(null);
  const callRef = useRef(null);
  const dialedRef = useRef(false);

  useEffect(() => {
    if (!sdkReady || !roomId || !token) return;

    let cancelled = false;

    (async () => {
      try {
        setStatus("Twilio connect…");
        const res = await fetch("/api/dem-calling/twilio/token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Token failed");

        const { Device } = window.Twilio;
        const device = new Device(data.token, {
          codecPreferences: ["opus", "pcmu"],
          closeProtection: true,
        });
        deviceRef.current = device;

        device.on("error", (e) => setStatus(`Error: ${e.message}`));

        await device.register();

        if (cancelled) return;

        setStatus(`Conference join — ${clientName}`);
        const connection = await device.connect({
          params: { conferenceName: roomId, role: "agent" },
        });
        callRef.current = connection;

        connection.on("accept", async () => {
          setStatus("✅ Connected — client ko call ja rahi hai…");
          if (dialedRef.current || !clientMobile) return;
          dialedRef.current = true;
          try {
            const dialRes = await fetch("/api/dem-calling/twilio/dial-client", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ roomId, callId }),
            });
            const dialData = await dialRes.json();
            if (dialData.success) {
              setStatus(`📞 ${clientName} (${clientMobile}) ko call gayi — baat karein`);
            } else {
              setStatus(dialData.message || "Client dial failed");
            }
          } catch (e) {
            setStatus(e.message || "Dial failed");
          }
        });

        connection.on("disconnect", () => setStatus("Call ended"));
      } catch (e) {
        if (!cancelled) setStatus(e.message || "Connect failed");
      }
    })();

    return () => {
      cancelled = true;
      callRef.current?.disconnect();
      deviceRef.current?.destroy();
    };
  }, [sdkReady, roomId, callId, token, clientName, clientMobile]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@twilio/voice-sdk@2.12.3/dist/twilio.min.js"
        onLoad={() => setSdkReady(true)}
      />
      <div style={{ padding: 16, fontFamily: "system-ui", fontSize: 14 }}>
        <p style={{ fontWeight: 700, color: "#059669" }}>📞 Silent Monitor Call</p>
        <p style={{ marginTop: 8, color: "#374151" }}>{status}</p>
        <p style={{ marginTop: 12, fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
          Client ko normal phone call aayegi — koi link nahi. Admin background mein dono sun sakta hai.
        </p>
      </div>
    </>
  );
}

export default function AgentCallPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <AgentCallInner />
    </Suspense>
  );
}
