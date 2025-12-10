import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AllContacts = ({ supportMember }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/contact');
      setContacts(response.data.contacts.reverse());
      setFilteredContacts(response.data.contacts);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

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

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  const handleDelete = () => {
    Swal.fire({
      icon: 'info',
      title: 'Restricted Action',
      text: 'Only admin can delete contacts',
      confirmButtonColor: '#3085d6',
    });
  };

  if (!supportMember?.allContactAccess) {
    return (
      <div className="text-center text-danger fw-bold mt-5">
        Admin can't give you access to this page.
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h1 className="fs-4 fw-bold mb-4">📞 All Contacts</h1>

        {/* Filters */}
        <div className="row g-3 mb-4">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div className="col-md-3" key={i}>
                  <Skeleton height={38} />
                </div>
              ))}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {error && <p className="text-danger">{error}</p>}

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td><Skeleton width={80} /></td>
                      <td><Skeleton width={150} /></td>
                      <td><Skeleton width={100} /></td>
                      <td><Skeleton count={1} /></td>
                      <td><Skeleton width={160} /></td>
                      <td><Skeleton width={60} height={30} /></td>
                    </tr>
                  ))
                : filteredContacts.length > 0
                ? filteredContacts.map((contact) => (
                    <tr key={contact._id}>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.phone}</td>
                      <td>{contact.description}</td>
                      <td>{formatDate(contact.createdAt)}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No contacts found.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllContacts;
