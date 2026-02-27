"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import BulkImportLeads from "@/components/sales/BulkImportLeads";
import ClientFilterModal from "@/components/ClientFilterModal";
import { useSalesChatSocket } from "@/lib/salesChatSocket";
import "@/components/styles/sales-dashboards.css";

export default function SalesAdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [assignTo, setAssignTo] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    assignedTo: "",
    search: "",
    paymentStatus: "",
    gst: "",
    dateFrom: "",
    dateTo: "",
  });
  const [reportDate, setReportDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [dailyReport, setDailyReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState(null);
  const [expandedReportEmployeeId, setExpandedReportEmployeeId] = useState(null);
  const [showEmployeeSidebar, setShowEmployeeSidebar] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeForm, setEmployeeForm] = useState({
    fullname: "",
    email: "",
    password: "",
    mobileNumber: "",
  });
  const [remarkData, setRemarkData] = useState({
    remark: "",
    remarkType: "general",
  });
  const [editingRemarkIndex, setEditingRemarkIndex] = useState(null);
  const [editingRemarkText, setEditingRemarkText] = useState("");
  const [editingRemarkType, setEditingRemarkType] = useState("general");
  const chatEndRef = useRef(null);
  const router = useRouter();
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showClientFilterModal, setShowClientFilterModal] = useState(false);
  const [showBestPerformerModal, setShowBestPerformerModal] = useState(false);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [leaderboardDateFilter, setLeaderboardDateFilter] = useState({
    byDay: "",
    startDate: "",
    endDate: "",
  });

  const filteredAssignEmployees = useMemo(() => {
    const query = employeeSearch.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter((emp) =>
      (emp.fullname || "").toLowerCase().includes(query)
    );
  }, [employees, employeeSearch]);

  const selectedAssignEmployee = useMemo(
    () => employees.find((emp) => emp._id === assignTo),
    [employees, assignTo]
  );

  // Chat list: all employees for admin, with last message & unread from conversations; sort unread first, then recent
  const chatList = useMemo(() => {
    const list = employees.map((emp) => {
      const conv = conversations.find(
        (c) => String(c.userId) === String(emp._id)
      );
      return {
        userId: emp._id,
        user: { fullname: emp.fullname, email: emp.email },
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
  }, [employees, conversations]);

  const remarkTypes = [
    { value: "general", label: "General" },
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" },
    { value: "followup", label: "Follow-up" },
    { value: "other", label: "Other" },
  ];

  const currentUserId = admin?.id;

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
        const token = localStorage.getItem("salesAdminToken");
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
    const token = localStorage.getItem("salesAdminToken");
    const adm = localStorage.getItem("salesAdmin");
    if (!token || !adm) {
      router.push("/sales-admin-login");
      return;
    }
    setAdmin(JSON.parse(adm));
    fetchData(token);
    fetchConversations(token);
    fetchLeaderboard(token);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("salesAdminToken");
    if (!token) return;
    fetchDailyReport(token, reportDate);
  }, [reportDate]);

  useEffect(() => {
    // Apply filters
    let filtered = [...leads];
    if (filters.status) {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }
    if (filters.assignedTo) {
      const aid = String(filters.assignedTo);
      filtered = filtered.filter(
        (lead) =>
          (lead.assignedTo?._id && String(lead.assignedTo._id) === aid) ||
          (lead.createdBy?._id && String(lead.createdBy._id) === aid)
      );
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
    if (filters.gst) {
      const gstLower = filters.gst.toLowerCase();
      filtered = filtered.filter(
        (lead) => (lead.gst || "").toLowerCase().includes(gstLower)
      );
    }
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter((lead) => {
        const created = lead.createdAt ? new Date(lead.createdAt) : null;
        if (!created) return false;
        if (filters.dateFrom) {
          const from = new Date(filters.dateFrom);
          from.setHours(0, 0, 0, 0);
          if (created < from) return false;
        }
        if (filters.dateTo) {
          const to = new Date(filters.dateTo);
          to.setHours(23, 59, 59, 999);
          if (created > to) return false;
        }
        return true;
      });
    }
    setFilteredLeads(filtered);
  }, [leads, filters]);

  useEffect(() => {
    if (selectedConversation) {
      const token = localStorage.getItem("salesAdminToken");
      if (token) {
        fetchChatMessages(token, selectedConversation.userId);
        if (currentUserId) emitMarkRead(currentUserId, selectedConversation.userId);
      }
    }
  }, [selectedConversation, currentUserId]);

  useEffect(() => {
    if (showChat) {
      const token = localStorage.getItem("salesAdminToken");
      if (token) fetchConversations(token);
    }
  }, [showChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchData = async (token) => {
    try {
      const [leadsRes, employeesRes, statsRes] = await Promise.all([
        fetch("/api/sales/leads", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/sales/admin/employees", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/sales/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [leadsData, employeesData, statsData] = await Promise.all([
        leadsRes.json(),
        employeesRes.json(),
        statsRes.json(),
      ]);

      if (leadsData.success) setLeads(leadsData.leads);
      if (employeesData.success) setEmployees(employeesData.employees);
      if (statsData.success) setStats(statsData.stats);
    } catch (err) {
      console.error("Fetch data error:", err);
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
      const res = await fetch(`/api/sales/chat?with=${withUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages);
      }
    } catch (err) {
      console.error("Fetch chat error:", err);
    }
  };

  const fetchDailyReport = async (token, date) => {
    setReportLoading(true);
    try {
      const res = await fetch(
        `/api/sales/admin/daily-report?date=${encodeURIComponent(date)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setDailyReport(data);
      else setDailyReport(null);
    } catch (err) {
      console.error("Daily report error:", err);
      setDailyReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchLeaderboard = async (token, dateFilter = null) => {
    try {
      const params = new URLSearchParams();
      const filter = dateFilter || leaderboardDateFilter;
      if (filter.byDay) params.set("byDay", filter.byDay);
      if (filter.startDate) params.set("startDate", filter.startDate);
      if (filter.endDate) params.set("endDate", filter.endDate);
      const qs = params.toString();
      const res = await fetch(
        `/api/sales/admin/leaderboard${qs ? `?${qs}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setLeaderboard(data.leaderboard);
      else setLeaderboard([]);
    } catch (err) {
      console.error("Leaderboard error:", err);
      setLeaderboard([]);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("salesAdminToken");
    try {
      const res = await fetch("/api/sales/admin/add-employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employeeForm),
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          type: "success",
          message: "Employee added successfully",
        });
        setShowAddEmployee(false);
        setEmployeeForm({
          fullname: "",
          email: "",
          password: "",
          mobileNumber: "",
        });
        fetchData(token);
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ type: "error", message: data.message || "Failed to add employee" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast({ type: "error", message: "Failed to add employee" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}? All assigned leads will be unassigned.`)) {
      return;
    }
    const token = localStorage.getItem("salesAdminToken");
    try {
      const res = await fetch(`/api/sales/admin/employees/${employeeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          type: "success",
          message: data.message || "Employee deleted successfully",
        });
        fetchData(token);
        setTimeout(() => setToast(null), 5000);
      } else {
        setToast({ type: "error", message: data.message || "Failed to delete employee" });
        setTimeout(() => setToast(null), 5000);
      }
    } catch (err) {
      setToast({ type: "error", message: "Failed to delete employee" });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleToggleEmployeeStatus = async (employeeId, currentStatus, employeeName) => {
    const token = localStorage.getItem("salesAdminToken");
    try {
      const res = await fetch(`/api/sales/admin/employees/${employeeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          type: "success",
          message: data.message || `Employee ${!currentStatus ? "activated" : "deactivated"}`,
        });
        fetchData(token);
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ type: "error", message: data.message || "Failed to update employee" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast({ type: "error", message: "Failed to update employee" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddRemark = async (leadId) => {
    if (!remarkData.remark.trim()) {
      alert("Please enter a remark");
      return;
    }
    const token = localStorage.getItem("salesAdminToken");
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
        fetchData(token);
      }
    } catch (err) {
      console.error("Add remark error:", err);
    }
  };

  const handleSaveEditRemark = async (leadId) => {
    if (editingRemarkIndex == null || !editingRemarkText.trim()) return;
    const token = localStorage.getItem("salesAdminToken");
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
        fetchData(token);
      } else {
        setToast({ type: "error", message: data.message || "Could not edit remark" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error("Edit remark error:", err);
    }
  };

  const handleBulkImport = async (leadsData, assignedToId, markAsPaid = false) => {
    const token = localStorage.getItem("salesAdminToken");
    try {
      // Handle undefined or empty assignedToId
      const assignToValue = assignedToId && typeof assignedToId === "string" && assignedToId.trim() !== "" 
        ? assignedToId.trim() 
        : null;

      const res = await fetch("/api/sales/leads/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leads: leadsData,
          assignedTo: assignToValue,
          markAsPaid: !!markAsPaid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          type: "success",
          message: data.message || `${data.imported} leads imported successfully${
            data.skipped > 0 ? `, ${data.skipped} skipped` : ""
          }`,
        });
        setShowBulkImport(false);
        fetchData(token);
        setTimeout(() => setToast(null), 5000);
      } else {
        setToast({ type: "error", message: data.message || "Import failed" });
        setTimeout(() => setToast(null), 5000);
      }
    } catch (err) {
      setToast({ type: "error", message: "Import failed: " + err.message });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleAssignLeads = async () => {
    if (!assignTo || selectedLeads.length === 0) {
      setToast({
        type: "error",
        message: "Please select leads and an employee",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const token = localStorage.getItem("salesAdminToken");
    try {
      const res = await fetch("/api/sales/admin/assign-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadIds: selectedLeads,
          assignedTo: assignTo,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        // HTTP error status
        setToast({
          type: "error",
          message: data.message || `Assignment failed (${res.status}). Please try again.`,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (data.success) {
        setToast({
          type: "success",
          message: data.message || `${data.modifiedCount || selectedLeads.length} leads assigned successfully`,
        });
        setSelectedLeads([]);
        setAssignTo("");
        fetchData(token);
        fetchLeaderboard(token);
        fetchDailyReport(token, reportDate);
        setTimeout(() => setToast(null), 5000);
      } else {
        setToast({
          type: "error",
          message: data.message || "Assignment failed. Please try again.",
        });
        setTimeout(() => setToast(null), 5000);
      }
    } catch (err) {
      console.error("Assign leads error:", err);
      setToast({
        type: "error",
        message: err.message || "Network error. Please check your connection and try again.",
      });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    const token = localStorage.getItem("salesAdminToken");
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
          toType: "SalesEmployee",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        setChatMessages((prev) => [...prev, data.message]);
        if (currentUserId && selectedConversation)
          emitNewMessage(selectedConversation.userId, data.message);
        const token = localStorage.getItem("salesAdminToken");
        if (token) fetchConversations(token);
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("salesAdminToken");
    localStorage.removeItem("salesAdmin");
    router.push("/sales-admin-login");
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
    <div className="min-h-screen bg-gray-50 pb-20">
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
            Sales Admin Dashboard
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
              {admin?.fullname}
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
        {/* Status cards – clickable to filter */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-6">
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "", paymentStatus: "" }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Leads</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{stats.totalLeads}</div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "new", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-gray-400 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{stats.newLeads}</div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "contacted", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacted</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{stats.contactedLeads}</div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: f.status, paymentStatus: "paid" }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Paid</div>
              <div className="mt-1 text-xl font-bold text-emerald-600">{stats.paidLeads ?? 0}</div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "converted", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Converted</div>
              <div className="mt-1 text-xl font-bold text-indigo-600">{stats.convertedLeads}</div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "followup", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-sky-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Follow-up</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{stats.followupLeads ?? 0}</div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "proposal", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-violet-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Proposal</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{stats.proposalLeads ?? 0}</div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "not_interested", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-400 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Not interested</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{stats.notInterestedLeads ?? 0}</div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "ringing", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ringing</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{stats.ringingLeads ?? 0}</div>
            </button>
            <button type="button" onClick={() => setFilters((f) => ({ ...f, status: "hotfollowup", paymentStatus: f.paymentStatus }))} className="sales-card-hover bg-white p-4 rounded-xl shadow-sm border-l-4 border-rose-500 text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hot follow-up</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{stats.hotfollowupLeads ?? 0}</div>
            </button>
          </div>
        )}

        {/* Buttons: Best Performer & Daily Report (open modals) */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            type="button"
            onClick={() => setShowBestPerformerModal(true)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-sm transition"
          >
            🏆 Best Performer
          </button>
          <button
            type="button"
            onClick={() => setShowDailyReportModal(true)}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl shadow-sm transition"
          >
            📅 Daily Report
          </button>
              <button
            onClick={() => {
              setShowBulkImport(!showBulkImport);
              setShowAddEmployee(false);
            }}
            className="sales-btn-primary px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition flex items-center gap-2"
          >
            {showBulkImport ? "Cancel Import" : "📥 Bulk Import Leads"}
          </button>

 <button
                  onClick={() => {
                    setShowAddEmployee(true);
                    setShowBulkImport(false);
                  }}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl shadow-sm transition"
                >
                  ➕ Add Employee - {employees.length} 
                </button>
          
              <button
                onClick={() => setShowEmployeeSidebar(true)}
                className="ml-auto px-4 py-2.5 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition"
              >
                View All Sales Team -
              </button>
           

        </div>

        {/* Main layout: left sidebar (filters) + content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar – Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 sticky top-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Assigned To</label>
                  <select
                    value={filters.assignedTo}
                    onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                    className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50/50 focus:bg-white transition"
                  >
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>{emp.fullname}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Search</label>
                  <input
                    type="text"
                    placeholder="Client, company, mobile, product…"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 bg-gray-50/50 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Payment</label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
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
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">GST</label>
                  <input
                    type="text"
                    placeholder="Search by GST"
                    value={filters.gst}
                    onChange={(e) => setFilters({ ...filters, gst: e.target.value })}
                    className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 bg-gray-50/50 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">From date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50/50 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">To date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50/50 focus:bg-white transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, dateFrom: "", dateTo: "" })}
                  className="w-full px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition"
                >
                  All time
                </button>
                <button
                  type="button"
                  onClick={() => setFilters({ status: "", assignedTo: "", paymentStatus: "", search: "", gst: "", dateFrom: "", dateTo: "" })}
                  className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg border border-gray-200 transition text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">


        {/* Action Buttons */}
        <div className="mb-6 flex gap-3 flex-wrap">
      
        </div>

        {/* Bulk Import */}
        {showBulkImport && (
          <div className="mb-6">
            <BulkImportLeads
              onImport={handleBulkImport}
              employees={employees}
            />
          </div>
        )}

        {/* Add Employee – modal popup */}
        {showAddEmployee && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b">
                <h2 className="text-lg font-bold text-gray-900">Add Sales Employee</h2>
                <button
                  onClick={() => setShowAddEmployee(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full p-1"
                  aria-label="Close add employee"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddEmployee} className="px-6 pb-6 pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                required
                value={employeeForm.fullname}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, fullname: e.target.value })
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
              <input
                type="email"
                placeholder="Email *"
                required
                value={employeeForm.email}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, email: e.target.value })
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
              <input
                type="password"
                placeholder="Password *"
                required
                value={employeeForm.password}
                onChange={(e) =>
                  setEmployeeForm({
                    ...employeeForm,
                    password: e.target.value,
                  })
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
              <input
                type="tel"
                placeholder="Mobile"
                value={employeeForm.mobileNumber}
                onChange={(e) =>
                  setEmployeeForm({
                    ...employeeForm,
                    mobileNumber: e.target.value,
                  })
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddEmployee(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
                  >
                    Cancel
                  </button>
            <button
              type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition text-sm"
            >
              Add Employee
            </button>
                </div>
          </form>
            </div>
          </div>
        )}

        {/* Bulk Assign - Sticky Bar */}
        {selectedLeads.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-amber-400 border-t border-amber-500/50 p-3 shadow-xl z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="bg-white/90 rounded-xl px-4 py-2.5 shadow-sm">
                  <span className="font-bold text-amber-900">
                    {selectedLeads.length} lead(s) selected
                  </span>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAssignDropdown((prev) => !prev)}
                    className="sales-input-focus border-2 border-amber-600/30 rounded-xl px-4 py-2.5 bg-white min-w-[220px] font-medium text-gray-900 flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <span role="img" aria-hidden="true">
                        👤
                      </span>
                      {selectedAssignEmployee?.fullname || "Select Employee"}
                    </span>
                    <span className="text-xs text-gray-500">▾</span>
                  </button>
                  {showAssignDropdown && (
                    <div className="absolute bottom-11 left-0 w-64 max-h-80 bg-white rounded-xl shadow-2xl border border-amber-500/40 p-2 space-y-2 z-50">
                      <input
                        type="text"
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        placeholder="Search employee…"
                        className="sales-input-focus w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                      />
                      <div className="max-h-52 overflow-y-auto">
                        {filteredAssignEmployees.length === 0 && (
                          <p className="text-xs text-gray-400 px-2 py-2">
                            No employees match your search.
                          </p>
                        )}
                        {filteredAssignEmployees.map((emp) => (
                          <button
                            key={emp._id}
                            type="button"
                            onClick={() => {
                              setAssignTo(emp._id);
                              setEmployeeSearch(emp.fullname || "");
                              setShowAssignDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-amber-50 ${
                              assignTo === emp._id
                                ? "bg-amber-100 text-amber-900 font-semibold"
                                : "text-gray-800"
                            }`}
                          >
                      {emp.fullname}
                          </button>
                        ))}
                      </div>
                      {assignTo && (
                        <button
                          type="button"
                          onClick={() => {
                            setAssignTo("");
                            setEmployeeSearch("");
                          }}
                          className="w-full text-left text-xs text-red-600 px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          Clear selection
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAssignLeads}
                  disabled={!assignTo}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow"
                >
                  ✅ Assign {selectedLeads.length} Lead(s)
                </button>
                <button
                  onClick={() => {
                    setSelectedLeads([]);
                    setAssignTo("");
                  }}
                  className="px-5 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition font-semibold text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-sm font-bold text-gray-900">
                All Leads ({filteredLeads.length})
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search by client, company, mobile or product…"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="sales-input-focus min-w-[200px] max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 bg-white focus:bg-white transition"
                />
                <select
                  value={filters.paymentStatus}
                  onChange={(e) =>
                    setFilters({ ...filters, paymentStatus: e.target.value })
                  }
                  className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:bg-white transition"
                  title="Filter by payment status"
                >
                  <option value="">All (Payment)</option>
                  <option value="paid">Paid only</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                </select>
                {filteredLeads.length > 0 && (
                  <button
                    onClick={() => {
                      if (selectedLeads.length === filteredLeads.length) {
                        setSelectedLeads([]);
                      } else {
                        setSelectedLeads(filteredLeads.map((l) => l._id));
                      }
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition"
                  >
                    {selectedLeads.length === filteredLeads.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                )}
              </div>
            </div>
          </div>
    <div className="relative h-[70vh] max-h-[350px] border border-gray-200 rounded-xl overflow-hidden">
  <div className="h-full overflow-auto">
            {filteredLeads.length === 0 ? (
              <div className="sales-empty-state">
                <div className="sales-empty-state-icon">📋</div>
                <p className="font-medium text-gray-600">
                  {leads.length === 0 ? "No leads yet" : "No leads match your filters"}
                </p>
                <p className="text-sm mt-1 text-gray-500">
                  {leads.length === 0 ? "Bulk import or ask your team to add leads." : "Try clearing filters or search."}
                </p>
                {leads.length === 0 && (
                  <button
                    onClick={() => { setShowBulkImport(true); setShowAddEmployee(false); }}
                    className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition"
                  >
                    📥 Bulk Import Leads
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop / Tablet table */}
                <table className="hidden md:table min-w-full">
            <thead className="bg-gray-50 sticky top-0 z-20 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-left">
                    <input
                      type="checkbox"
                      checked={
                        filteredLeads.length > 0 &&
                        selectedLeads.length === filteredLeads.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads(filteredLeads.map((l) => l._id));
                        } else {
                          setSelectedLeads([]);
                        }
                      }}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    GST
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm divide-gray-100">
                    {filteredLeads.map((lead, index) => (
                      <tr
                        key={lead._id}
                        className={`sales-table-row-hover transition ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                        }`}
                      >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads([...selectedLeads, lead._id]);
                          } else {
                            setSelectedLeads(
                              selectedLeads.filter((id) => id !== lead._id)
                            );
                          }
                        }}
                        className="cursor-pointer w-4 h-4"
                      />
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lead.gst || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          {lead.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <span>{lead.assignedTo.fullname}</span>
                              {lead.createdBy &&
                                String(lead.assignedTo._id || lead.assignedTo) ===
                                  String(lead.createdBy._id || lead.createdBy) &&
                                !lead.assignedBy && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                    Self-assigned
                                  </span>
                                )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Unassigned
                              {lead.createdBy?.fullname && (
                                <span className="ml-1 text-xs text-gray-500">
                                  (created by {lead.createdBy.fullname})
                                </span>
                              )}
                            </span>
                          )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          const token = localStorage.getItem("salesAdminToken");
                          fetch(`/api/sales/leads/${lead._id}`, {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ status: e.target.value }),
                          }).then(() => {
                            fetchData(token);
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
                          const token = localStorage.getItem("salesAdminToken");
                          fetch(`/api/sales/leads/${lead._id}`, {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ paymentStatus: e.target.value }),
                          }).then(() => {
                            fetchData(token);
                            fetchLeaderboard(token);
                            fetchDailyReport(token, reportDate);
                            setToast({ type: "success", message: "Payment status updated" });
                            setTimeout(() => setToast(null), 2000);
                          });
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer ${
                          lead.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : lead.paymentStatus === "partial"
                            ? "bg-yellow-100 text-yellow-800"
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
                      <select
                        value={lead.assignedTo?._id || ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            fetch(`/api/sales/leads/${lead._id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem(
                                  "salesAdminToken"
                                )}`,
                              },
                              body: JSON.stringify({
                                assignedTo: e.target.value,
                              }),
                            }).then(() => {
                              const token =
                                localStorage.getItem("salesAdminToken");
                              fetchData(token);
                            });
                          }
                        }}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="">Assign</option>
                        {employees.map((emp) => (
                              <option key={emp._id} value={emp._id}>
                            {emp.fullname}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filteredLeads.map((lead) => (
                    <div key={lead._id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLeads([...selectedLeads, lead._id]);
                                } else {
                                  setSelectedLeads(
                                    selectedLeads.filter((id) => id !== lead._id)
                                  );
                                }
                              }}
                              className="cursor-pointer w-4 h-4 mt-0.5"
                            />
                            <p className="font-semibold text-gray-900">
                              {lead.clientName}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {lead.companyName || "-"}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-xs text-gray-500">{lead.mobile}</p>
                          {lead.assignedTo ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 gap-1">
                              <span>{lead.assignedTo.fullname}</span>
                              {lead.createdBy &&
                                String(lead.assignedTo._id || lead.assignedTo) ===
                                  String(lead.createdBy._id || lead.createdBy) &&
                                !lead.assignedBy && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-semibold">
                                    Self
                                  </span>
                                )}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                      {lead.product && (
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Product: </span>
                          {lead.product}
                        </p>
                      )}
                      {lead.gst && (
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">GST: </span>
                          {lead.gst}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={lead.status}
                          onChange={(e) => {
                            const token = localStorage.getItem("salesAdminToken");
                            fetch(`/api/sales/leads/${lead._id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ status: e.target.value }),
                            }).then(() => {
                              fetchData(token);
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
                        <select
                          value={lead.paymentStatus || "pending"}
                          onChange={(e) => {
                            const token = localStorage.getItem("salesAdminToken");
                            fetch(`/api/sales/leads/${lead._id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ paymentStatus: e.target.value }),
                            }).then(() => {
                              fetchData(token);
                              fetchLeaderboard(token);
                              fetchDailyReport(token, reportDate);
                              setToast({
                                type: "success",
                                message: "Payment status updated",
                              });
                              setTimeout(() => setToast(null), 2000);
                            });
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer ${
                            lead.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : lead.paymentStatus === "partial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="partial">Partial</option>
                          <option value="not_applicable">N/A</option>
                        </select>
                        <button type="button" onClick={() => setShowRemarkModal(lead._id)} className="ml-auto text-xs text-indigo-600 font-medium underline">
                          {lead.remarks?.length ? `${lead.remarks.length} remark(s)` : "Remark"}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <select
                          value={lead.assignedTo?._id || ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              fetch(`/api/sales/leads/${lead._id}`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${localStorage.getItem(
                                    "salesAdminToken"
                                  )}`,
                                },
                                body: JSON.stringify({
                                  assignedTo: e.target.value,
                                }),
                              }).then(() => {
                                const token =
                                  localStorage.getItem("salesAdminToken");
                                fetchData(token);
                              });
                            }
                          }}
                          className="text-xs border rounded px-2 py-1 bg-white"
                        >
                          <option value="">Assign</option>
                          {employees.map((emp) => (
                            <option key={emp._id} value={emp._id}>
                              {emp.fullname}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        </div>
          </div>
        </div>
      </main>

      {/* Best Performer Modal */}
      {showBestPerformerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Best Performers</h2>
              <button type="button" onClick={() => setShowBestPerformerModal(false)} className="text-gray-500 hover:text-gray-700 rounded-full p-1" aria-label="Close">✕</button>
            </div>
            <div className="px-6 py-3 border-b bg-gray-50/50 flex flex-wrap items-center gap-3 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-600">Filter by date:</span>
              <label className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">By day</span>
                <input
                  type="date"
                  value={leaderboardDateFilter.byDay}
                  onChange={(e) => setLeaderboardDateFilter((f) => ({ ...f, byDay: e.target.value, startDate: "", endDate: "" }))}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Start</span>
                <input
                  type="date"
                  value={leaderboardDateFilter.startDate}
                  onChange={(e) => setLeaderboardDateFilter((f) => ({ ...f, startDate: e.target.value, byDay: "" }))}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">End</span>
                <input
                  type="date"
                  value={leaderboardDateFilter.endDate}
                  onChange={(e) => setLeaderboardDateFilter((f) => ({ ...f, endDate: e.target.value, byDay: "" }))}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const token = localStorage.getItem("salesAdminToken");
                  if (token) fetchLeaderboard(token, leaderboardDateFilter);
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setLeaderboardDateFilter({ byDay: "", startDate: "", endDate: "" });
                  const token = localStorage.getItem("salesAdminToken");
                  if (token) fetchLeaderboard(token, { byDay: "", startDate: "", endDate: "" });
                }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {leaderboard && leaderboard.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assigned</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contacted</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Converted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaderboard.slice(0, 20).map((row) => (
                        <tr key={row.employeeId} className="hover:bg-gray-50">
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              row.rank === 1 ? "bg-amber-100 text-amber-800" :
                              row.rank === 2 ? "bg-slate-200 text-slate-700" :
                              row.rank === 3 ? "bg-orange-100 text-orange-800" :
                              "bg-gray-100 text-gray-600"
                            }`}>{row.rank}</span>
                          </td>
                          <td className="px-6 py-3 font-medium text-gray-900">{row.fullname}</td>
                          <td className="px-6 py-3 text-gray-600">{row.assignedTotal}</td>
                          <td className="px-6 py-3 text-gray-600">{row.contactedTotal}</td>
                          <td className="px-6 py-3 font-semibold text-emerald-600">{row.paidCount}</td>
                          <td className="px-6 py-3 font-semibold text-indigo-600">{row.convertedCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No leaderboard data yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Daily Report Modal */}
      {showDailyReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Daily Report</h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Date</span>
                  <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" />
                </label>
                {reportLoading && <span className="flex items-center gap-2 text-sm text-gray-500"><span className="sales-spinner-sm inline-block" /> Loading…</span>}
                <button type="button" onClick={() => setShowDailyReportModal(false)} className="text-gray-500 hover:text-gray-700 rounded-full p-1" aria-label="Close">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {dailyReport && dailyReport.report && dailyReport.report.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Today</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacted Today</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Converted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dailyReport.report.map((row) => {
                        const expanded = expandedReportEmployeeId === row.employeeId?.toString();
                        return (
                          <React.Fragment key={row.employeeId}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-3">
                                <button type="button" onClick={() => setExpandedReportEmployeeId(expanded ? null : row.employeeId?.toString())} className="text-gray-500 hover:text-indigo-600">{expanded ? "▼" : "▶"}</button>
                              </td>
                              <td className="px-6 py-3 font-medium">{row.fullname}</td>
                              <td className="px-6 py-3">{row.assignedTotal}</td>
                              <td className="px-6 py-3">{row.assignedToday}</td>
                              <td className="px-6 py-3">{row.contactedTotal}</td>
                              <td className="px-6 py-3">{row.contactedToday}</td>
                              <td className="px-6 py-3 text-green-600">{row.paidCount}</td>
                              <td className="px-6 py-3 text-indigo-600">{row.convertedCount}</td>
                              <td className="px-6 py-3 text-red-600">{row.lostCount}</td>
                              <td className="px-6 py-3">
                                <button type="button" onClick={() => { setFilters((f) => ({ ...f, assignedTo: String(row.employeeId) })); setShowDailyReportModal(false); }} className="text-indigo-600 hover:underline text-sm">View leads</button>
                              </td>
                            </tr>
                            {expanded && row.leads && row.leads.length > 0 && (
                              <tr>
                                <td colSpan={10} className="px-6 py-4 bg-gray-50">
                                  <div className="text-sm space-y-2 max-h-64 overflow-y-auto">
                                    {row.leads.map((l) => (
                                      <div key={l._id} className="flex flex-wrap items-center gap-4 py-2 border-b border-gray-200 last:border-0">
                                        <span className="font-medium">{l.clientName}</span>
                                        <span className="text-gray-600">{l.companyName || "-"}</span>
                                        <span className="text-gray-600">{l.product}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${l.status === "converted" ? "bg-green-100" : l.status === "lost" ? "bg-red-100" : "bg-gray-100"}`}>{l.status}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${l.paymentStatus === "paid" ? "bg-green-100" : "bg-gray-100"}`}>{l.paymentStatus || "pending"}</span>
                                        {l.lastRemark && <span className="text-gray-500 truncate max-w-[200px]" title={l.lastRemark.remark}>{l.lastRemark.remarkType}: {l.lastRemark.remark}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="sales-empty-state py-12">
                  <div className="sales-empty-state-icon">📅</div>
                  <p className="font-medium text-gray-600">{reportLoading ? "Loading…" : "No report data for this date."}</p>
                  <p className="text-sm mt-1 text-gray-500">{reportLoading ? "" : "Select another date or add employees and assign leads."}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remark Modal – all remarks/chats shown inside modal */}
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
                      const isFromAdmin = r.addedByType === "SalesAdmin";
                      const canEdit = isFromAdmin && (String(r.addedBy?._id ?? r.addedBy) === String(admin?.id));
                      const isEditing = editingRemarkIndex === idx;
                      return (
                        <div
                          key={idx}
                          className={`flex ${isFromAdmin ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm border ${
                            isFromAdmin
                              ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                              : "bg-gray-50 border-gray-200 text-gray-800"
                          }`}>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-gray-500">
                                {isFromAdmin ? "Admin" : "Team"}
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
              <h2 className="text-xl font-bold">Chat with Team</h2>
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
                    No team members yet. Add employees to start chatting.
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
                      {conv.user?.fullname || "Employee"}
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
                            String(msg.from._id) === String(admin?.id)
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs rounded-lg p-2 ${
                              String(msg.from._id) === String(admin?.id)
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
                              {String(msg.from._id) === String(admin?.id) && (
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

      {/* Employees Sidebar – full sales team list */}
      {showEmployeeSidebar && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowEmployeeSidebar(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sales Team</h2>
                <p className="text-xs text-gray-500">
                  Total members: {employees.length}
                </p>
              </div>
              <button
                onClick={() => setShowEmployeeSidebar(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1"
                aria-label="Close sales team"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {employees.length === 0 ? (
                <div className="sales-empty-state">
                  <div className="sales-empty-state-icon">👥</div>
                  <p className="font-medium text-gray-600">No employees yet</p>
                  <p className="text-sm mt-1 text-gray-500">
                    Add your first sales team member to get started.
                  </p>
                </div>
              ) : (
                employees.map((emp) => (
                  <div
                    key={emp._id}
                    className={`border rounded-xl px-4 py-3 flex items-start justify-between gap-3 ${
                      emp.isActive ? "bg-white" : "bg-gray-50 opacity-90"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{emp.fullname}</p>
                      <p className="text-xs text-gray-500">{emp.email}</p>
                      {emp.mobileNumber && (
                        <p className="text-xs text-gray-500">{emp.mobileNumber}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          emp.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            handleToggleEmployeeStatus(
                              emp._id,
                              emp.isActive,
                              emp.fullname
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${
                            emp.isActive
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          }`}
                        >
                          {emp.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp._id, emp.fullname)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-[11px] font-medium hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setShowEmployeeSidebar(false);
                  setShowAddEmployee(true);
                  setShowBulkImport(false);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition"
              >
                ➕ Add Employee
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
