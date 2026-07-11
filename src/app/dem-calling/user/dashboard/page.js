"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCallingSocket } from "@/lib/dem-calling/useCallingSocket";

export default function CallingUserDashboard() {
  const [agent, setAgent] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientMobile, setClientMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const { connected, startAgentCall, endAgentCall, cleanupPeer } = useCallingSocket(
    "calling-agent",
    agent?.id
  );

  const token =
    typeof window !== "undefined" ? localStorage.getItem("callingAgentToken") : null;

  useEffect(() => {
    const t = localStorage.getItem("callingAgentToken");
    const a = localStorage.getItem("callingAgent");
    if (!t || !a) {
      router.push("/dem-calling/user/login");
      return;
    }
    setAgent(JSON.parse(a));
  }, [router]);

  useEffect(() => {
    if (!token || !agent) return;
    fetch("/api/dem-calling/calls?status=active", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(async (data) => {
        if (data.success && data.calls?.length > 0) {
          const call = data.calls[0];
          setActiveCall(call);
          if (connected) await startAgentCall(call);
        }
      });
  }, [token, agent, connected, startAgentCall]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStartCall = async () => {
    if (!clientName.trim()) {
      showToast("error", "Client name required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dem-calling/calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clientName, clientMobile }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveCall(data.call);
        await startAgentCall(data.call);
        showToast("success", "Call started — mic active. Admin silently sun sakta hai.");
      } else {
        showToast("error", data.message);
      }
    } catch {
      showToast("error", "Failed to start call");
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    setLoading(true);
    try {
      await fetch(`/api/dem-calling/calls/${activeCall._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "end" }),
      });
      endAgentCall(activeCall.roomId);
      cleanupPeer();
      setActiveCall(null);
      setClientName("");
      setClientMobile("");
      showToast("success", "Call ended");
    } catch {
      showToast("error", "Failed to end call");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    cleanupPeer();
    localStorage.removeItem("callingAgentToken");
    localStorage.removeItem("callingAgent");
    router.push("/dem-calling/user/login");
  };

  if (!agent) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white shadow-lg ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <header className="bg-emerald-700 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">DEM Calling — Agent</h1>
          <p className="text-emerald-200 text-sm">
            {agent.fullname} · {connected ? "Connected" : "Connecting…"}
          </p>
        </div>
        <button onClick={logout} className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">
          Logout
        </button>
      </header>

      <main className="max-w-lg mx-auto p-6">
        {!activeCall ? (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-lg font-bold mb-4">Start Call</h2>
            <input
              placeholder="Client Name *"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 mb-3"
            />
            <input
              placeholder="Client Mobile"
              value={clientMobile}
              onChange={(e) => setClientMobile(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 mb-4"
            />
            <button
              onClick={handleStartCall}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {loading ? "Starting…" : "📞 Start Call"}
            </button>
            <p className="text-xs text-gray-400 mt-3">
              Mic permission allow karein. Admin panel se call silently monitor ho sakti hai.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
            <div className="text-6xl mb-4 animate-pulse">📞</div>
            <h2 className="text-xl font-bold text-gray-900">Call Active</h2>
            <p className="text-gray-600 mt-1">{activeCall.clientName}</p>
            {activeCall.clientMobile && (
              <p className="text-gray-500 text-sm">{activeCall.clientMobile}</p>
            )}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              Mic Live — baat karein
            </div>
            <button
              onClick={handleEndCall}
              disabled={loading}
              className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50"
            >
              End Call
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
