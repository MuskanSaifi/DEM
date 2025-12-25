import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const AllContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('/api/contact');
        console.log('Contacts fetched:', response.data);
        setContacts(response.data.contacts.reverse()); // Assuming contacts are inside 'contacts' field
        setFilteredContacts(response.data.contacts); // Initialize filtered contacts
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

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

        {/* Skeleton table */}
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
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
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact._id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>
                  <td>{contact.description}</td>
                  <td>{formatDate(contact.createdAt)}</td> {/* Show formatted date */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllContacts;
