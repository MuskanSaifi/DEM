import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Payments = () => {
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayment();
  }, []);

  const getPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/userprofile/profile/userprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentDetail(response.data.user);
    } catch (error) {
      console.log(`Something went wrong: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getLatestPackage = () => {
    if (!paymentDetail?.userPackage || paymentDetail.userPackage.length === 0) return null;
    return paymentDetail.userPackage[paymentDetail.userPackage.length - 1];
  };

  const getTotalPayments = () => {
    return paymentDetail?.userPackage?.length || 0;
  };

  if (loading) {
    return (
<div className="flex justify-center items-center min-h-[60vh]">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-content bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 min-h-screen">
      <div className="container">
        <div className="bg-white shadow-2xl rounded-4 p-5 border border-gray-200">
          {/* Header */}
          <div className="d-flex justify-between align-items-center mb-4">
            <h2 className="fw-bold text-xl md:text-2xl text-gray-800">
              All <span className="text-purple-600">Payments</span>
            </h2>
            <Link href="/become-a-member" className="flex items-center gap-2 text-blue-600 hover:underline">
              <Image src="/assets/dashboardicons/payment-link-img.png" alt="Payment Link" width={24} height={24} />
              <span className="text-sm font-medium">Payment Link</span>
            </Link>
          </div>

          {/* Total Payments Count */}
          <div className="mb-3">
            <h5 className="text-dark">
              Total Payments Done: <span className="text-primary">{getTotalPayments()}</span>
            </h5>
          </div>

          {/* Current Package Details */}
          {paymentDetail && paymentDetail.userPackage?.length > 0 ? (
            <>
              <div className="mb-3">
                <h4 className="text-success fw-semibold mb-1">
                  Package: {getLatestPackage()?.packageName}
                </h4>
                <p className="text-muted">Package Price ₹{parseInt(getLatestPackage()?.totalAmount / 1.18)}</p>
              </div>

              <div className="row g-3 mb-4">
                {[
                  {
                    label: "Total Amount with GST (18%)",
                    value: `₹${getLatestPackage()?.totalAmount}`,
                    color: "text-dark"
                  },
                  {
                    label: "Paid Amount",
                    value: `₹${getLatestPackage()?.paidAmount}`,
                    color: "text-success"
                  },
                  {
                    label: "Remaining Amount",
                    value: `₹${getLatestPackage()?.remainingAmount}`,
                    color: "text-danger"
                  },
                ].map((item, i) => (
                  <div className="col-md-4" key={i}>
                    <div className="p-3 border rounded-4 bg-light text-center shadow-sm">
                      <h6 className="text-muted">{item.label}</h6>
                      <h4 className={item.color}>{item.value}</h4>
                    </div>
                  </div>
                ))}

                <div className="col-md-6">
                  <div className="p-3 border rounded-4 bg-light text-center shadow-sm">
                    <h6 className="text-muted">Start Date</h6>
                    <h5>{new Date(getLatestPackage()?.packageStartDate).toLocaleDateString('en-GB')}</h5>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 border rounded-4 bg-light text-center shadow-sm">
                    <h6 className="text-muted">Expiry Date</h6>
                    <h5>{new Date(getLatestPackage()?.packageExpiryDate).toLocaleDateString('en-GB')}</h5>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-danger">No Payments available</p>
          )}

          {/* All Previous Packages */}
          {paymentDetail?.userPackage?.length > 1 && (
            <div className="mt-5">
              <h4 className="text-primary mb-4">🧾 All Packages:</h4>
              <div className="row g-4">
                {paymentDetail.userPackage
                  .slice(0, -1)
                  .reverse()
                  .map((pkg, index) => (
                    <div className="col-md-6" key={index}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm h-100">
                        <h6 className="fw-bold text-secondary mb-3">{pkg.packageName}</h6>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="badge bg-primary text-white">
                            Total: ₹{Number(pkg.totalAmount).toLocaleString()}
                          </span>
                          <span className="badge bg-success text-white">
                            Paid: ₹{Number(pkg.paidAmount).toLocaleString()}
                          </span>
                          <span className={`badge text-white ${Number(pkg.remainingAmount) === 0 ? 'bg-secondary' : 'bg-danger'}`}>
                            Remaining: ₹{Number(pkg.remainingAmount).toLocaleString()}
                          </span>
                        </div>
                        <p className="mb-1">
                          <strong>From:</strong> {new Date(pkg.packageStartDate).toLocaleDateString('en-GB')}
                        </p>
                        <p className="mb-0">
                          <strong>To:</strong> {new Date(pkg.packageExpiryDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;
