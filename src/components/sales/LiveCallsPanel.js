"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Script from "next/script";
import { useCallingSocket } from "@/lib/dem-calling/useCallingSocket";

function loadTwilioDevice(token, roomId) {
  const { Device } = window.Twilio;
  const device = new Device(token, { codecPreferences: ["opus", "pcmu"] });
  return device.register().then(() =>
    device.connect({ params: { conferenceName: roomId, role: "admin" } }).then((conn) => ({
      device,
      connection: conn,
    }))
  );
}

export default function LiveCallsPanel({ adminId, token }) {
  const [listeningRoom, setListeningRoom] = useState(null);
  const [listenStatus, setListenStatus] = useState("");
  const [needsUnmute, setNeedsUnmute] = useState(false);
  const [twilioEnabled, setTwilioEnabled] = useState(false);
  const [twilioSdkReady, setTwilioSdkReady] = useState(false);
  const twilioDeviceRef = useRef(null);
  const twilioCallRef = useRef(null);

  const { connected, activeCalls, listenToCall, cleanupPeer, monitorAudioRef } =
    useCallingSocket("sales-admin", adminId);

  useEffect(() => {
    fetch("/api/dem-calling/config")
      .then((r) => r.json())
      .then((d) => setTwilioEnabled(!!d.twilioEnabled))
      .catch(() => {});
  }, []);

  const stopTwilio = useCallback(() => {
    twilioCallRef.current?.disconnect();
    twilioDeviceRef.current?.destroy();
    twilioCallRef.current = null;
    twilioDeviceRef.current = null;
  }, []);

  const stopListening = useCallback(() => {
    stopTwilio();
    cleanupPeer();
    setListeningRoom(null);
    setListenStatus("");
    setNeedsUnmute(false);
  }, [cleanupPeer, stopTwilio]);

  const handleListenTwilio = async (call) => {
    if (!twilioSdkReady || !window.Twilio) {
      setListenStatus("Twilio SDK loading…");
      return;
    }

    const res = await fetch("/api/dem-calling/twilio/token?role=admin", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Twilio token failed");

    const monitorRes = await fetch(`/api/dem-calling/calls/${call._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "monitor" }),
    });
    const monitorData = await monitorRes.json();
    if (!monitorData.success) throw new Error(monitorData.message || "Monitor failed");

    const { device, connection } = await loadTwilioDevice(data.token, call.roomId);
    twilioDeviceRef.current = device;
    twilioCallRef.current = connection;
    setListeningRoom(call.roomId);
    setListenStatus("👂 Sun rahe hain — agent + client (client ko pata nahi chalega)");
  };

  const handleListenWebRtc = async (call) => {
    const res = await fetch(`/api/dem-calling/calls/${call._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "monitor" }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Monitor failed");

    setListeningRoom(call.roomId);
    await listenToCall({
      ...call,
      agentId: call.agentId?._id || call.agentId,
    });
    setListenStatus("👂 Agent ki awaaz (mic-only mode)");
    setTimeout(() => {
      if (monitorAudioRef.current?.paused) setNeedsUnmute(true);
    }, 2000);
  };

  const handleListen = async (e, call) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!token || !adminId) return;

    setListenStatus("Connecting…");
    setNeedsUnmute(false);

    try {
      if (twilioEnabled) {
        await handleListenTwilio(call);
      } else {
        await handleListenWebRtc(call);
      }
    } catch (err) {
      setListenStatus(err.message || "Connection failed");
      setListeningRoom(null);
      stopTwilio();
      cleanupPeer();
    }
  };

  const unmuteAudio = (e) => {
    e?.preventDefault?.();
    const el = monitorAudioRef.current;
    if (el) {
      el.volume = 1;
      el.play().then(() => setNeedsUnmute(false)).catch(() => {});
    }
  };

  if (!adminId) return null;

  return (
    <>
      {twilioEnabled && (
        <Script
          src="https://cdn.jsdelivr.net/npm/@twilio/voice-sdk@2.12.3/dist/twilio.min.js"
          onLoad={() => setTwilioSdkReady(true)}
        />
      )}
      <audio ref={monitorAudioRef} autoPlay playsInline className="hidden" />

      <div className="mb-6 bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
        <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-gray-900">📞 Live Calls — Silent Monitor</h3>
            <p className="text-xs text-gray-500">
              Yahi dashboard par suniye · {twilioEnabled ? "Twilio PSTN" : "Mic-only"} ·{" "}
              {connected ? "🟢 Live" : "🟡 Connecting…"}
            </p>
          </div>
          {listeningRoom && (
            <button
              type="button"
              onClick={stopListening}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg font-semibold"
            >
              Stop Listening
            </button>
          )}
        </div>

        {(listenStatus || needsUnmute) && (
          <div className="px-5 py-3 bg-indigo-100 border-b border-indigo-200 flex flex-wrap items-center gap-3">
            {listenStatus && <span className="text-sm text-indigo-900 font-medium">{listenStatus}</span>}
            {needsUnmute && !twilioEnabled && (
              <button
                type="button"
                onClick={unmuteAudio}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold"
              >
                🔊 Unmute Audio
              </button>
            )}
          </div>
        )}

        {activeCalls.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500 text-center">Koi active call nahi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Agent</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Client</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Mobile</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeCalls.map((call) => {
                  const isListening = listeningRoom === call.roomId;
                  return (
                    <tr key={call.roomId} className={isListening ? "bg-indigo-50" : "hover:bg-gray-50"}>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          LIVE
                        </span>
                      </td>
                      <td className="px-4 py-2 font-medium">{call.agentName || "—"}</td>
                      <td className="px-4 py-2">{call.clientName}</td>
                      <td className="px-4 py-2">{call.clientMobile || "—"}</td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={(e) => (isListening ? stopListening() : handleListen(e, call))}
                          className={`px-4 py-2 rounded-lg text-xs font-bold ${
                            isListening
                              ? "bg-red-100 text-red-700 border border-red-300"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          {isListening ? "⏹ Stop" : "👂 Listen Live"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="px-5 py-2 text-xs text-gray-500 border-t bg-gray-50">
          <strong>FREE mode:</strong> Agent phone se client ko call kare + <strong>Speaker ON</strong> rakhe. App mic se
          dono ki awaaz admin tak bhejti hai. Twilio / client link ki zaroorat nahi.
        </p>
      </div>
    </>
  );
}
