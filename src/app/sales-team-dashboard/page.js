"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import ClientFilterModal from "@/components/ClientFilterModal";
import { useSalesChatSocket } from "@/lib/salesChatSocket";
import "@/components/styles/sales-dashboards.css";

export default function SalesTeamDashboard() {
  const [employee, setEmployee] = useState(null);
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [chatContacts, setChatContacts] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    clientName: "",
    companyName: "",
    mobile: "",
    email: "",
    state: "",
    product: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    paymentStatus: "",
  });
  const [showClientFilterModal, setShowClientFilterModal] = useState(false);
  const [remarkData, setRemarkData] = useState({
    remark: "",
    remarkType: "general",
  });
  const [editingRemarkIndex, setEditingRemarkIndex] = useState(null);
  const [editingRemarkText, setEditingRemarkText] = useState("");
  const [editingRemarkType, setEditingRemarkType] = useState("general");
  const chatEndRef = useRef(null);
  const router = useRouter();

  const remarkTypes = [
    { value: "general", label: "General" },
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" },
    { value: "followup", label: "Follow-up" },
    { value: "other", label: "Other" },
  ];

  const currentUserId = employee?.id;

  // Chat list: admins to chat with, merged with conversation data; sort unread first, then recent
  const chatList = useMemo(() => {
    const list = chatContacts.map((contact) => {
      const conv = conversations.find(
        (c) => String(c.userId) === String(contact.userId)
      );
      return {
        userId: contact.userId,
        user: contact.user,
        lastMessage: conv?.lastMessage ?? null,
        unreadCount: conv?.unreadCount ?? 0,
      };
    });
    return list.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [chatContacts, conversations]);

  const { connected: socketConnected, emitNewMessage, emitMarkRead } = useSalesChatSocket(
    currentUserId,
    {
      onNewMessage: (message) => {
        const fromId = message?.from?._id || message?.from;
        const toId = message?.to?._id || message?.to;
        const isForCurrentConversation =
          selectedConversation &&
          (String(fromId) === String(selectedConversation.userId) ||
            String(toId) === String(selectedConversation.userId));
        if (isForCurrentConversation) {
          setChatMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
        }
        const token = localStorage.getItem("salesEmployeeToken");
        if (token) fetchConversations(token);
      },
      onMessagesRead: (payload) => {
        if (selectedConversation && String(payload?.readBy) === String(selectedConversation.userId)) {
          setChatMessages((prev) =>
            prev.map((m) => ({ ...m, isRead: true }))
          );
        }
      },
    }
  );

  useEffect(() => {
    const token = localStorage.getItem("salesEmployeeToken");
    const emp = localStorage.getItem("salesEmployee");
    if (!token || !emp) {
      router.push("/sales-team-login");
      return;
    }
    setEmployee(JSON.parse(emp));
    fetchLeads(token);
    fetchConversations(token);
    fetchChatContacts(token);
  }, []);

  const fetchChatContacts = async (token) => {
    try {
      const res = await fetch("/api/sales/chat/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setChatContacts(data.contacts || []);
    } catch (err) {
      console.error("Fetch chat contacts error:", err);
    }
  };

  useEffect(() => {
    // Paid leads are hidden from list: only show non-paid in My Leads
    const visibleLeads = leads.filter(
      (lead) => (lead.paymentStatus || "pending") !== "paid"
    );
    let filtered = [...visibleLeads];
    if (filters.status) {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }
    if (filters.paymentStatus) {
      if (filters.paymentStatus === "unpaid") {
        filtered = filtered.filter(
          (lead) => ["pending", "partial"].includes(lead.paymentStatus || "pending")
        );
      } else {
        filtered = filtered.filter(
          (lead) => (lead.paymentStatus || "pending") === filters.paymentStatus
        );
      }
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.clientName?.toLowerCase().includes(search) ||
          lead.companyName?.toLowerCase().includes(search) ||
          lead.mobile?.includes(search) ||
          lead.email?.toLowerCase().includes(search) ||
          lead.product?.toLowerCase().includes(search)
      );
    }
    setFilteredLeads(filtered);
  }, [leads, filters]);

  useEffect(() => {
    if (selectedConversation) {
      const token = localStorage.getItem("salesEmployeeToken");
      if (token) {
        fetchChatMessages(token, selectedConversation.userId);
        if (currentUserId) emitMarkRead(currentUserId, selectedConversation.userId);
      }
    }
  }, [selectedConversation, currentUserId]);

  useEffect(() => {
    if (showChat) {
      const token = localStorage.getItem("salesEmployeeToken");
      if (token) {
        fetchConversations(token);
        fetchChatContacts(token);
      }
    }
  }, [showChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchLeads = async (token) => {
    try {
      const res = await fetch("/api/sales/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error("Fetch leads error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async (token) => {
    try {
      const res = await fetch("/api/sales/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    }
  };

  const fetchChatMessages = async (token, withUserId) => {
    try {
      const res = await fetch(
        `/api/sales/chat?with=${withUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages);
      }
    } catch (err) {
      console.error("Fetch chat error:", err);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("salesEmployeeToken");
    const { clientName, companyName, mobile, email, state, product } = formData;
    if (!clientName || !mobile || !product) {
      alert("Client name, mobile, and product are required");
      return;
    }
    try {
      const res = await fetch("/api/sales/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clientName, companyName, mobile, email, state, product }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: "Lead added successfully!" });
        setShowAddLead(false);
        setFormData({
          clientName: "",
          companyName: "",
          mobile: "",
          email: "",
          state: "",
          product: "",
        });
        fetchLeads(token);
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ type: "error", message: data.message || "Failed to add lead" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error("Add lead error:", err);
    }
  };

  const handleAddRemark = async (leadId) => {
    if (!remarkData.remark.trim()) {
      alert("Please enter a remark");
      return;
    }
    const token = localStorage.getItem("salesEmployeeToken");
    try {
      const res = await fetch(`/api/sales/leads/${leadId}/remarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(remarkData),
      });
      const data = await res.json();
      if (data.success) {
        setShowRemarkModal(null);
        setRemarkData({ remark: "", remarkType: "general" });
        fetchLeads(token);
      }
    } catch (err) {
      console.error("Add remark error:", err);
    }
  };

  const handleSaveEditRemark = async (leadId) => {
    if (editingRemarkIndex == null || !editingRemarkText.trim()) return;
    const token = localStorage.getItem("salesEmployeeToken");
    try {
      const res = await fetch(`/api/sales/leads/${leadId}/remarks`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          remarkIndex: editingRemarkIndex,
          remark: editingRemarkText.trim(),
          remarkType: editingRemarkType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingRemarkIndex(null);
        setEditingRemarkText("");
        setEditingRemarkType("general");
        fetchLeads(token);
      } else {
        setToast({ type: "error", message: data.message || "Could not edit remark" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error("Edit remark error:", err);
    }
  };

  const handleSelfAssign = async (leadId) => {
    const token = localStorage.getItem("salesEmployeeToken");
    try {
      const res = await fetch(`/api/sales/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ selfAssign: true }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: "Lead assigned to you!" });
        fetchLeads(token);
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ type: "error", message: data.message || "Failed to assign" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error("Self assign error:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    const token = localStorage.getItem("salesEmployeeToken");
    try {
      const res = await fetch("/api/sales/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: selectedConversation.userId,
          message: newMessage,
          toType: "SalesAdmin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        setChatMessages((prev) => [...prev, data.message]);
        if (currentUserId && selectedConversation)
          emitNewMessage(selectedConversation.userId, data.message);
        const token = localStorage.getItem("salesEmployeeToken");
        if (token) fetchConversations(token);
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("salesEmployeeToken");
    localStorage.removeItem("salesEmployee");
    router.push("/sales-team-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="sales-spinner" />
        <p className="text-gray-500 font-medium">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`sales-toast-enter fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <span className="text-lg">{toast.type === "success" ? "✓" : "✕"}</span>
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-1 rounded-lg hover:bg-white/20 transition"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sales Team Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowClientFilterModal(true)}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-medium transition border border-white/20 flex items-center gap-2"
            >
              🔍 Filter Clients
            </button>
            <ClientFilterModal
              isOpen={showClientFilterModal}
              onClose={() => setShowClientFilterModal(false)}
              onApply={(vals) => {
                const parts = [vals.name, vals.email, vals.phone, vals.businessName].filter(Boolean);
                setFilters((f) => ({
                  ...f,
                  search: parts.join(" "),
                  paymentStatus: vals.paymentStatus || "",
                }));
                // Modal stays open so user can see search result
              }}
            />
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-medium transition relative border border-white/20 flex items-center gap-2"
            >
              💬 Chat
              {socketConnected && (
                <span className="h-2 w-2 rounded-full bg-green-400" title="Connected" />
              )}
              {chatList.some((c) => c.unreadCount > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-400 text-white rounded-full min-w-[1.25rem] h-5 px-1.5 text-xs flex items-center justify-center font-bold">
                  {chatList.reduce((sum, c) => sum + c.unreadCount, 0)}
                </span>
              )}
            </button>
            <span className="hidden sm:inline px-3 py-1.5 bg-white/10 rounded-lg text-white text-sm font-medium">
              {employee?.fullname}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition shadow"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50/50 focus:bg-white transition"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
                <option value="followup">Follow-up</option>
                <option value="proposal">Proposal</option>
                <option value="not_interested">Not interested</option>
                <option value="ringing">Ringing</option>
                <option value="hotfollowup">Hot follow-up</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Payment</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  setFilters({ ...filters, paymentStatus: e.target.value })
                }
                className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50/50 focus:bg-white transition"
              >
                <option value="">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="not_applicable">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Search</label>
              <input
                type="text"
                placeholder="Name, email, phone, company, product…"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 bg-gray-50/50 focus:bg-white transition"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: "", paymentStatus: "", search: "" })}
                className="sales-btn-primary px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg border border-gray-200 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* My Summary – status cards clickable to filter */}
        {leads.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-6">
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "", paymentStatus: "" }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned to me</div>
              <div className="mt-1 text-xl font-bold text-gray-900">
                {leads.filter((l) => (l.paymentStatus || "pending") !== "paid").length}
              </div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "contacted", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacted</div>
              <div className="mt-1 text-xl font-bold text-gray-900">
                {leads.filter((l) => l.status === "contacted").length}
              </div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: f.status, paymentStatus: "paid" }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Paid</div>
              <div className="mt-1 text-xl font-bold text-emerald-600">
                {leads.filter((l) => l.paymentStatus === "paid").length}
              </div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "converted", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Converted</div>
              <div className="mt-1 text-xl font-bold text-indigo-600">
                {leads.filter((l) => l.status === "converted").length}
              </div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "followup", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-sky-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Follow-up</div>
              <div className="mt-1 text-xl font-bold text-gray-900">
                {leads.filter((l) => l.status === "followup").length}
              </div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "proposal", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-violet-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Proposal</div>
              <div className="mt-1 text-xl font-bold text-gray-900">
                {leads.filter((l) => l.status === "proposal").length}
              </div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "not_interested", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-400 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Not interested</div>
              <div className="mt-1 text-xl font-bold text-gray-900">
                {leads.filter((l) => l.status === "not_interested").length}
              </div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "ringing", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ringing</div>
              <div className="mt-1 text-xl font-bold text-gray-900">
                {leads.filter((l) => l.status === "ringing").length}
              </div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "hotfollowup", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-rose-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hot follow-up</div>
              <div className="mt-1 text-xl font-bold text-gray-900">
                {leads.filter((l) => l.status === "hotfollowup").length}
              </div>
            </button>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setShowAddLead(!showAddLead)}
            className="sales-btn-primary px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition flex items-center gap-2"
          >
            {showAddLead ? "✕ Cancel" : "➕ Add New Lead"}
          </button>
        </div>

        {showAddLead && (
          <form
            onSubmit={handleAddLead}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Lead</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Client Name *"
                required
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
              <input
                type="tel"
                placeholder="Mobile *"
                required
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
              <input
                type="text"
                placeholder="Product Description *"
                required
                value={formData.product}
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm sm:col-span-2"
              />
            </div>
            <button
              type="submit"
              className="mt-5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition"
            >
              Add Lead
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">My Leads ({filteredLeads.length})</h2>
          </div>
          <div className="overflow-x-auto">
            {filteredLeads.length === 0 ? (
              <div className="sales-empty-state">
                <div className="sales-empty-state-icon">📋</div>
                <p className="font-medium text-gray-600">
                  {leads.length === 0 ? "No leads yet" : "No leads match your filters"}
                </p>
                <p className="text-sm mt-1 text-gray-500">
                  {leads.length === 0 ? "Add your first lead to get started." : "Try clearing filters or search."}
                </p>
                {leads.length === 0 && (
                  <button
                    onClick={() => setShowAddLead(true)}
                    className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition"
                  >
                    ➕ Add New Lead
                  </button>
                )}
              </div>
            ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="sales-table-row-hover transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.companyName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.mobile}
                    </td>
                    <td className="px-6 py-4">{lead.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          const token = localStorage.getItem("salesEmployeeToken");
                          fetch(`/api/sales/leads/${lead._id}`, {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ status: e.target.value }),
                          }).then(() => {
                            fetchLeads(token);
                            setToast({
                              type: "success",
                              message: "Status updated",
                            });
                            setTimeout(() => setToast(null), 2000);
                          });
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                          lead.status === "converted"
                            ? "bg-green-100 text-green-800"
                            : lead.status === "qualified"
                            ? "bg-blue-100 text-blue-800"
                            : lead.status === "contacted"
                            ? "bg-yellow-100 text-yellow-800"
                            : lead.status === "lost"
                            ? "bg-red-100 text-red-800"
                            : lead.status === "followup"
                            ? "bg-sky-100 text-sky-800"
                            : lead.status === "proposal"
                            ? "bg-violet-100 text-violet-800"
                            : lead.status === "not_interested"
                            ? "bg-red-100 text-red-800"
                            : lead.status === "ringing"
                            ? "bg-orange-100 text-orange-800"
                            : lead.status === "hotfollowup"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                        <option value="followup">Follow-up</option>
                        <option value="proposal">Proposal</option>
                        <option value="not_interested">Not interested</option>
                        <option value="ringing">Ringing</option>
                        <option value="hotfollowup">Hot follow-up</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.paymentStatus || "pending"}
                        onChange={(e) => {
                          const token = localStorage.getItem("salesEmployeeToken");
                          const newVal = e.target.value;
                          fetch(`/api/sales/leads/${lead._id}`, {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ paymentStatus: newVal }),
                          }).then(() => {
                            fetchLeads(token);
                            setToast({
                              type: "success",
                              message: newVal === "paid" ? "Marked paid. Lead will no longer show in list." : "Payment status updated",
                            });
                            setTimeout(() => setToast(null), 2500);
                          });
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                          lead.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : lead.paymentStatus === "partial"
                            ? "bg-amber-100 text-amber-800"
                            : lead.paymentStatus === "not_applicable"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="not_applicable">N/A</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => setShowRemarkModal(lead._id)} className="text-indigo-600 hover:underline font-medium text-sm">
                        {lead.remarks?.length ? `${lead.remarks.length} remark(s)` : "Remark"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <div className="flex gap-2">
                        {!lead.assignedTo && (
                          <button
                            onClick={() => handleSelfAssign(lead._id)}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                          >
                            ✋ Self Assign
                          </button>
                        )}
                        <button type="button" onClick={() => setShowRemarkModal(lead._id)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                          💬 Remark
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </main>

      {/* Remark Modal – all remarks shown inside modal, same as admin */}
      {showRemarkModal && (() => {
        const leadForRemark = leads.find((l) => l._id === showRemarkModal);
        const remarksList = leadForRemark?.remarks || [];
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-900">Remarks {leadForRemark ? `– ${leadForRemark.clientName}` : ""}</h2>
                <button type="button" onClick={() => { setShowRemarkModal(null); setRemarkData({ remark: "", remarkType: "general" }); setEditingRemarkIndex(null); }} className="text-gray-500 hover:text-gray-700 rounded-full p-1" aria-label="Close">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
                {remarksList.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">All remarks</p>
                    {remarksList.map((r, idx) => {
                      const isFromTeam = r.addedByType === "SalesEmployee";
                      const canEdit = isFromTeam && (String(r.addedBy?._id ?? r.addedBy) === String(employee?.id));
                      const isEditing = editingRemarkIndex === idx;
                      return (
                        <div
                          key={idx}
                          className={`flex ${isFromTeam ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm border ${
                            isFromTeam
                              ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                              : "bg-gray-50 border-gray-200 text-gray-800"
                          }`}>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-gray-500">
                                {isFromTeam ? "Team" : "Admin"}
                              </span>
                              {canEdit && !isEditing && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRemarkIndex(idx);
                                    setEditingRemarkText(r.remark || "");
                                    setEditingRemarkType(r.remarkType || "general");
                                  }}
                                  className="text-xs text-indigo-600 hover:underline"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                            {isEditing ? (
                              <div className="mt-2 space-y-2">
                                <select
                                  value={editingRemarkType}
                                  onChange={(e) => setEditingRemarkType(e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                  {remarkTypes.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                                </select>
                                <textarea
                                  value={editingRemarkText}
                                  onChange={(e) => setEditingRemarkText(e.target.value)}
                                  rows={2}
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => handleSaveEditRemark(showRemarkModal)} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded">Save</button>
                                  <button type="button" onClick={() => { setEditingRemarkIndex(null); setEditingRemarkText(""); }} className="text-xs px-2 py-1 bg-gray-200 rounded">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="font-semibold text-indigo-600"> · {r.remarkType}:</span>{" "}
                                <span>{r.remark}</span>
                                {r.editedAt && (
                                  <span className="block text-xs text-gray-500 italic">Edited</span>
                                )}
                                {r.createdAt && (
                                  <span className="block text-xs text-gray-400 mt-1">
                                    {new Date(r.createdAt).toLocaleString()}
                                    {r.editedAt ? ` · Edited ${new Date(r.editedAt).toLocaleString()}` : ""}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No remarks yet.</p>
                )}
                <div className="border-t pt-4 mt-4 flex-shrink-0">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Add new remark</p>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Remark Type</label>
                    <select value={remarkData.remarkType} onChange={(e) => setRemarkData({ ...remarkData, remarkType: e.target.value })} className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                      {remarkTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Remark</label>
                    <textarea value={remarkData.remark} onChange={(e) => setRemarkData({ ...remarkData, remark: e.target.value })} rows={3} className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400" placeholder="Enter your remark…" />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => handleAddRemark(showRemarkModal)} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition">Add</button>
                    <button type="button" onClick={() => { setShowRemarkModal(null); setRemarkData({ remark: "", remarkType: "general" }); }} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Chat with Admin</h2>
              <button
                onClick={() => {
                  setShowChat(false);
                  setSelectedConversation(null);
                }}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/3 border-r overflow-y-auto">
                {chatList.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    Loading contacts…
                  </div>
                ) : (
                  chatList.map((conv) => (
                  <div
                    key={conv.userId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 cursor-pointer hover:bg-gray-100 ${
                      selectedConversation?.userId === conv.userId
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <div className="font-semibold">
                      {conv.user?.fullname || "Admin"}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {conv.lastMessage?.message || "No messages yet"}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="text-xs bg-red-500 text-white rounded-full px-2 py-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                )))}
              </div>
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${
                            String(msg.from._id) === String(employee?.id)
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs rounded-lg p-2 ${
                              String(msg.from._id) === String(employee?.id)
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200"
                            }`}
                          >
                            <div className="text-xs opacity-75">
                              {msg.from.fullname}
                            </div>
                            <div>{msg.message}</div>
                            <div className="text-xs opacity-75 mt-1 flex items-center justify-between gap-2">
                              <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                              {String(msg.from._id) === String(employee?.id) && (
                                <span className={msg.isRead ? "text-blue-200" : "text-white/80"}>
                                  {msg.isRead ? "✓✓ Read" : "✓ Sent"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 border rounded px-3 py-2"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    Select a conversation
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
