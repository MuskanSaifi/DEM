"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCallingSocket } from "@/lib/dem-calling/useCallingSocket";

export default function CallingAdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [agents, setAgents] = useState([]);
  const [endedCalls, setEndedCalls] = useState([]);
  const [listeningRoom, setListeningRoom] = useState(null);
  const [toast, setToast] = useState(null);
  const [agentForm, setAgentForm] = useState({
    fullname: "",
    email: "",
    password: "",
    mobile: "",
  });
  const router = useRouter();

  const {
    connected,
    activeCalls,
    listenToCall,
    cleanupPeer,
    monitorAudioRef,
  } = useCallingSocket("calling-admin", admin?.id);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("callingAdminToken") : null;

  const fetchAgents = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/dem-calling/admin/agents", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setAgents(data.agents || []);
  }, [token]);

  const fetchEndedCalls = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/dem-calling/calls?status=ended", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setEndedCalls(data.calls || []);
  }, [token]);

  useEffect(() => {
    const t = localStorage.getItem("callingAdminToken");
    const a = localStorage.getItem("callingAdmin");
    if (!t || !a) {
      router.push("/dem-calling/admin/login");
      return;
    }
    setAdmin(JSON.parse(a));
  }, [router]);

  useEffect(() => {
    if (admin) {
      fetchAgents();
      fetchEndedCalls();
    }
  }, [admin, fetchAgents, fetchEndedCalls]);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/dem-calling/admin/agents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(agentForm),
    });
    const data = await res.json();
    if (data.success) {
      setToast({ type: "success", message: "Agent added" });
      setAgentForm({ fullname: "", email: "", password: "", mobile: "" });
      fetchAgents();
    } else {
      setToast({ type: "error", message: data.message });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleListen = async (call) => {
    await fetch(`/api/dem-calling/calls/${call._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "monitor" }),
    });
    setListeningRoom(call.roomId);
    await listenToCall({
      ...call,
      agentId: call.agentId?._id || call.agentId,
    });
    setToast({ type: "success", message: "Silent monitor active — agent/client ko pata nahi chalega" });
    setTimeout(() => setToast(null), 4000);
  };

  const stopListening = () => {
    cleanupPeer();
    setListeningRoom(null);
  };

  const logout = () => {
    localStorage.removeItem("callingAdminToken");
    localStorage.removeItem("callingAdmin");
    router.push("/dem-calling/admin/login");
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <audio ref={monitorAudioRef} autoPlay playsInline className="hidden" />

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white shadow-lg ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <header className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">DEM Calling — Admin</h1>
          <p className="text-indigo-200 text-sm">
            Welcome, {admin.fullname}
            {connected ? " · Live" : " · Connecting…"}
          </p>
        </div>
        <button onClick={logout} className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Live Calls */}
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">🔴 Live Calls ({activeCalls.length})</h2>
            {listeningRoom && (
              <button
                onClick={stopListening}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Stop Listening
              </button>
            )}
          </div>
          {activeCalls.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Koi active call nahi hai</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Agent</th>
                    <th className="px-4 py-2 text-left">Client</th>
                    <th className="px-4 py-2 text-left">Mobile</th>
                    <th className="px-4 py-2 text-left">Started</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeCalls.map((call) => (
                    <tr key={call.roomId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{call.agentName || "—"}</td>
                      <td className="px-4 py-3">{call.clientName}</td>
                      <td className="px-4 py-3">{call.clientMobile || "—"}</td>
                      <td className="px-4 py-3">
                        {call.startedAt
                          ? new Date(call.startedAt).toLocaleTimeString("en-IN")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleListen(call)}
                          disabled={listeningRoom === call.roomId}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-semibold"
                        >
                          {listeningRoom === call.roomId ? "👂 Listening…" : "👂 Silent Listen"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">
            Silent monitor: Admin sirf sunta hai, call mein awaaz nahi jaati — agent/client ko pata nahi chalega.
          </p>
        </section>

        {/* Add Agent */}
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">Add Calling Agent</h2>
          <form onSubmit={handleAddAgent} className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="Full name *"
              required
              value={agentForm.fullname}
              onChange={(e) => setAgentForm({ ...agentForm, fullname: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email *"
              required
              value={agentForm.email}
              onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password *"
              required
              value={agentForm.password}
              onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              placeholder="Mobile"
              value={agentForm.mobile}
              onChange={(e) => setAgentForm({ ...agentForm, mobile: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <button
              type="submit"
              className="sm:col-span-2 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl"
            >
              Add Agent
            </button>
          </form>
        </section>

        {/* Agents list */}
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">Agents ({agents.length})</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <div key={a._id} className="border rounded-xl p-3">
                <p className="font-semibold">{a.fullname}</p>
                <p className="text-xs text-gray-500">{a.email}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
