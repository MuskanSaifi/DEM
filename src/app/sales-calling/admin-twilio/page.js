"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

function AdminTwilioInner() {
  const sp = useSearchParams();
  const roomId = sp.get("roomId");
  const callId = sp.get("callId");
  const token = sp.get("token");

  const [status, setStatus] = useState("Loading…");
  const [sdkReady, setSdkReady] = useState(false);
  const deviceRef = useRef(null);
  const callRef = useRef(null);

  useEffect(() => {
    if (!sdkReady || !roomId || !token) return;

    let cancelled = false;

    (async () => {
      try {
        if (callId) {
          await fetch(`/api/dem-calling/calls/${callId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: "monitor" }),
          });
        }

        const res = await fetch("/api/dem-calling/twilio/token?role=admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Token failed");

        const { Device } = window.Twilio;
        const device = new Device(data.token, { codecPreferences: ["opus", "pcmu"] });
        deviceRef.current = device;
        await device.register();

        if (cancelled) return;

        const connection = await device.connect({
          params: { conferenceName: roomId, role: "admin" },
        });
        callRef.current = connection;

        connection.on("accept", () => setStatus("👂 Sun rahe hain — agent + client (silent)"));
        connection.on("disconnect", () => setStatus("Disconnected"));
      } catch (e) {
        if (!cancelled) setStatus(e.message || "Listen failed");
      }
    })();

    return () => {
      cancelled = true;
      callRef.current?.disconnect();
      deviceRef.current?.destroy();
    };
  }, [sdkReady, roomId, callId, token]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@twilio/voice-sdk@2.12.3/dist/twilio.min.js"
        onLoad={() => setSdkReady(true)}
      />
      <div style={{ padding: 20, fontFamily: "system-ui", textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#4F46E5" }}>{status}</p>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 12 }}>
          Aap muted hain — client ko pata nahi chalega
        </p>
      </div>
    </>
  );
}

export default function AdminTwilioPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <AdminTwilioInner />
    </Suspense>
  );
}
