import React, { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PRESET_REMARKS = ["Follow up", "Called", "Emailed", "Resolved", "Closed", "Spam", "Not interested"];

const AllContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [remarkModal, setRemarkModal] = useState({ open: false, contactId: null });
  const [customRemark, setCustomRemark] = useState("");
  const [addingRemark, setAddingRemark] = useState(false);

  const fetchContacts = async () => {
    try {
      const response = await axios.get("/api/contact");
      const list = response.data.contacts || [];
      const reversed = [...list].reverse();
      setContacts(reversed);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const addRemark = async (contactId, text) => {
    if (!text?.trim()) return;
    setAddingRemark(true);
    try {
      const res = await axios.patch(`/api/contact/${contactId}`, {
        remark: text.trim(),
        addedBy: "Admin",
      });
      if (res.data?.success) {
        setRemarkModal({ open: false, contactId: null });
        setCustomRemark("");
        await fetchContacts();
      }
    } catch (err) {
      console.error("Error adding remark:", err);
    } finally {
      setAddingRemark(false);
    }
  };

  const openRemarkModal = (contactId) => {
    setRemarkModal({ open: true, contactId });
    setCustomRemark("");
  };
  const closeRemarkModal = () => setRemarkModal({ open: false, contactId: null });

  // Filter contacts based on the filter state
  useEffect(() => {
    let filtered = contacts;

    if (searchName) {
      filtered = filtered.filter((contact) =>
        contact.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchEmail) {
      filtered = filtered.filter((contact) =>
        contact.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    if (searchPhone) {
      filtered = filtered.filter((contact) =>
        contact.phone.toLowerCase().includes(searchPhone.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter((contact) => {
        const contactDate = new Date(contact.createdAt).toISOString().split('T')[0];
        return contactDate === filterDate;
      });
    }

    setFilteredContacts(filtered);
  }, [searchName, searchEmail, searchPhone, filterDate, contacts]);

  // Function to format date and time
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Ensures AM/PM format
    }).format(new Date(date));
  };

if (loading) {
  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h1 className="fs-4 fw-bold mb-4">📞 All Contacts</h1>

        {/* Skeleton filters */}
        <div className="row g-3 mb-4">
          {Array(4).fill().map((_, i) => (
            <div className="col-md-3" key={i}>
              <Skeleton height={38} />
            </div>
          ))}
        </div>

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th><Skeleton /></th>
                <th><Skeleton /></th>
                <th><Skeleton /></th>
                <th><Skeleton /></th>
                <th><Skeleton /></th>
                <th><Skeleton /></th>
              </tr>
            </thead>
            <tbody>
              {Array(5).fill().map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <td><Skeleton height={20} /></td>
                  <td><Skeleton height={20} /></td>
                  <td><Skeleton height={20} /></td>
                  <td><Skeleton height={20} /></td>
                  <td><Skeleton height={20} /></td>
                  <td><Skeleton height={20} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h1 className="fs-4 fw-bold mb-4"> 📞 All Contacts</h1>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="email"
              className="form-control"
              placeholder="Search by email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by phone"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Created At</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact._id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>
                  <td className="text-break" style={{ maxWidth: 280 }}>{contact.description}</td>
                  <td>{formatDate(contact.createdAt)}</td>
                  <td style={{ minWidth: 200 }}>
                    <div className="d-flex flex-column gap-1">
                      {(contact.remarks && contact.remarks.length > 0) ? (
                        <ul className="list-unstyled mb-1 small">
                          {contact.remarks.map((r, i) => (
                            <li key={i} className="bg-light rounded px-2 py-1 mb-1">
                              <span className="text-dark">{r.text}</span>
                              <span className="text-muted ms-1" style={{ fontSize: "0.75rem" }}>
                                {r.addedAt ? formatDate(r.addedAt) : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted small">No remarks</span>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary align-self-start"
                        onClick={() => openRemarkModal(contact._id)}
                      >
                        + Add remark
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Remark Modal */}
        {remarkModal.open && (
          <div className="modal d-block bg-dark bg-opacity-25" tabIndex={-1} style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Remark</h5>
                  <button type="button" className="btn-close" onClick={closeRemarkModal} aria-label="Close" />
                </div>
                <div className="modal-body">
                  <p className="small text-muted mb-2">Preset options (click to add):</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {PRESET_REMARKS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={addingRemark}
                        onClick={() => addRemark(remarkModal.contactId, preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <hr />
                  <label className="form-label small">Or add custom remark:</label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Type custom remark..."
                      value={customRemark}
                      onChange={(e) => setCustomRemark(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRemark(remarkModal.contactId, customRemark);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      disabled={addingRemark || !customRemark.trim()}
                      onClick={() => addRemark(remarkModal.contactId, customRemark)}
                    >
                      {addingRemark ? "..." : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllContacts;
