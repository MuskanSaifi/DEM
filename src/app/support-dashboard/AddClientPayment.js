'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddClientPayment = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
      countryCode: '+91', // default
    mobileNumber: '',
    companyName: '',
    packageName: '',
    totalAmount: '',
    paidAmount: '',
    remainingAmount: '',
    packageStartDate: '',
    packageExpiryDate: '',
    orderId: '',
    transactionId: '',
    paymentMethod: '',
    payerEmail: '',
    payerMobile: '',
    paymentResponse: '',
    supportPerson: ''
  });
  const [supportPersons, setSupportPersons] = useState([]);
  useEffect(() => {
    const fetchSupportPersons = async () => {
      try {
        const res = await axios.get('/api/support-admins/add-user-payment');
        setSupportPersons(res.data.data); // adjust if your response structure is different
      } catch (error) {
        console.error('Error fetching support persons', error);
        toast.error('Failed to load support persons');
      }
    };
    fetchSupportPersons();
  }, []);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/support-admins/add-user-payment', {
        ...formData,
          mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
        totalAmount: Number(formData.totalAmount),
        paidAmount: Number(formData.paidAmount),
        remainingAmount: Number(formData.remainingAmount),
        paymentResponse: { note: 'Manual entry from support form' }
      });
      toast.success('User and Payment saved successfully!');
      setFormData({
        fullname: '',
        email: '',
          countryCode: '+91', // ← missing in your reset
        mobileNumber: '',
        companyName: '',
        packageName: '',
        totalAmount: '',
        paidAmount: '',
        remainingAmount: '',
        packageStartDate: '',
        packageExpiryDate: '',
        orderId: '',
        transactionId: '',
        paymentMethod: '',
        payerEmail: '',
        payerMobile: '',
        paymentResponse: '',
        supportPerson: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
<div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
  <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-8">
    <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-10">Add Client & Payment</h2>

    <form onSubmit={handleSubmit} className="space-y-12">

      {/* === Client Info Section === */}
      <section className="border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Client Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label htmlFor="fullname" className="block text-gray-700 font-medium mb-1">Full Name *</label>
            <input id="fullname" name="fullname" placeholder="Full Name *" className="input-style" value={formData.fullname} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
            <input id="email" name="email" placeholder="Email" className="input-style" value={formData.email} onChange={handleChange} />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <div className="w-1/4">
              <label htmlFor="countryCode" className="block text-gray-700 font-medium mb-1">Country Code</label>
              <select id="countryCode" name="countryCode" className="input-style" value={formData.countryCode} onChange={handleChange} required>
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
              </select>
            </div>
            <div className="w-3/4">
              <label htmlFor="mobileNumber" className="block text-gray-700 font-medium mb-1">Mobile Number *</label>
              <input id="mobileNumber" name="mobileNumber" placeholder="Mobile Number *" className="input-style" value={formData.mobileNumber} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label htmlFor="companyName" className="block text-gray-700 font-medium mb-1">Company Name</label>
            <input id="companyName" name="companyName" placeholder="Company Name" className="input-style" value={formData.companyName} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="supportPerson" className="block text-gray-700 font-medium mb-1">Support Person</label>
            <select id="supportPerson" name="supportPerson" className="input-style" value={formData.supportPerson} onChange={handleChange} required>
              <option value="">Select Support Person</option>
              {supportPersons.map(person => (
                <option key={person._id} value={person._id}>{person.name} - {person.email}</option>
              ))}
            </select>
          </div>

        </div>
      </section>

      {/* === Package Info Section === */}
      <section className="border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Package Details</h3> 
         
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="packageName" className="block text-gray-700 font-medium mb-1">Package Name *</label>
            <input id="packageName" name="packageName" placeholder="Package Name *" className="input-style" value={formData.packageName} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="totalAmount" className="block text-gray-700 font-medium mb-1">Total Amount</label>
            <input type="number" id="totalAmount" name="totalAmount" placeholder="Total Amount" className="input-style" value={formData.totalAmount} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="paidAmount" className="block text-gray-700 font-medium mb-1">Paid Amount</label>
            <input type="number" id="paidAmount" name="paidAmount" placeholder="Paid Amount" className="input-style" value={formData.paidAmount} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="remainingAmount" className="block text-gray-700 font-medium mb-1">Remaining Amount</label>
            <input type="number" id="remainingAmount" name="remainingAmount" placeholder="Remaining Amount" className="input-style" value={formData.remainingAmount} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="packageStartDate" className="block text-gray-700 font-medium mb-1">Start Date</label>
            <input type="date" id="packageStartDate" name="packageStartDate" className="input-style" value={formData.packageStartDate} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="packageExpiryDate" className="block text-gray-700 font-medium mb-1">Expiry Date</label>
            <input type="date" id="packageExpiryDate" name="packageExpiryDate" className="input-style" value={formData.packageExpiryDate} onChange={handleChange} />
          </div>

        </div>
      </section>


      {/* === Payment Info Section === */}
      <section className="border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="orderId" className="block text-gray-700 font-medium mb-1">Order ID *</label>
            <input id="orderId" name="orderId" placeholder="Order ID *" className="input-style" value={formData.orderId} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="transactionId" className="block text-gray-700 font-medium mb-1">Transaction ID</label>
            <input id="transactionId" name="transactionId" placeholder="Transaction ID" className="input-style" value={formData.transactionId} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-gray-700 font-medium mb-1">Payment Method</label>
            <input id="paymentMethod" name="paymentMethod" placeholder="Payment Method" className="input-style" value={formData.paymentMethod} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="payerEmail" className="block text-gray-700 font-medium mb-1">Payer Email</label>
            <input id="payerEmail" name="payerEmail" placeholder="Payer Email" className="input-style" value={formData.payerEmail} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="payerMobile" className="block text-gray-700 font-medium mb-1">Payer Mobile</label>
            <input id="payerMobile" name="payerMobile" placeholder="Payer Mobile" className="input-style" value={formData.payerMobile} onChange={handleChange} />
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="text-center pt-4">
        <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-10 rounded-lg shadow-md transform hover:scale-105 transition duration-300">
          Save Client & Payment
        </button>
      </div>
    </form>
  </div>
</div>


  );
};

export default AddClientPayment;
