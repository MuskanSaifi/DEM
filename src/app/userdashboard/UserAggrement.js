  'use client';

  import React, { useState, useEffect, useRef } from 'react';
  import dynamic from 'next/dynamic';
  import trimCanvas from 'trim-canvas';

  // Dynamically import SignatureCanvas with ssr: false
  const SignatureCanvas = dynamic(() => import('react-signature-canvas'), {
    ssr: false,
  });

  // Dynamically import PDFClientSideWrapper with ssr: false
  const PDFClientSideWrapper = dynamic(
    () => import('./components/PDFClientSideWrapper'),
    {
      ssr: false,
      loading: () => (
        <p className="text-center p-6 text-gray-500">Loading PDF module...</p>
      ),
    }
  );

  const UserAggrement = ({ user }) => {
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [isSignaturePresent, setIsSignaturePresent] = useState(false);
    const signatureRef = useRef(null);

    // Function to fetch agreements from the API
    const fetchAgreements = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/Aggrements/aggrements');
        if (!response.ok) {
          throw new Error(`Failed to fetch agreements (Status: ${response.status})`);
        }
        const result = await response.json();
        setAgreements(result.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Could not load agreements. Please try again. Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchAgreements();
      setIsClient(true);
    }, []);

    const userAgreement = agreements.find((a) => a.userId === user?._id);

    // Function to request a new agreement
    const handleRequestAgreement = async () => {
      if (!user || !user._id) {
        // Replaced alert with a state update to show an error message in the UI
        setError('User not authenticated. Please log in to request an agreement.');
        return;
      }
      const requestBody = {
        userId: user._id,
        clientName: 'New Client',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      try {
        const response = await fetch('/api/Aggrements/aggrements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
          throw new Error(`Failed to send request (Status: ${response.status}).`);
        }
        fetchAgreements();
      } catch (err) {
        console.error('Request error:', err);
        setError('Could not send agreement request.');
      }
    };

    const handleSignatureEnd = () => {
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        setIsSignaturePresent(true);
      } else {
        setIsSignaturePresent(false);
      }
    };

    const handleClearSignature = () => {
      signatureRef.current.clear();
      setIsSignaturePresent(false);
    };

    // Function to save the signature
    const handleSaveSignature = async () => {
      if (
        signatureRef.current &&
        typeof signatureRef.current.getCanvas === 'function' &&
        !signatureRef.current.isEmpty()
      ) {
        const rawCanvas = signatureRef.current.getCanvas();
        const trimmedCanvas = trimCanvas.default
          ? trimCanvas.default(rawCanvas)
          : trimCanvas(rawCanvas);
        const signatureImage = trimmedCanvas.toDataURL('image/png');

        if (!userAgreement || !userAgreement._id) {
          setError("Agreement ID is missing.");
          return;
        }

        try {
          const response = await fetch(`/api/Aggrements/${userAgreement._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              signatureImage,
              status: 'signed',
              signedAt: new Date().toISOString(),
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to save signature (Status: ${response.status})`);
          }

          const result = await response.json();
          console.log("Signature saved successfully:", result);
          fetchAgreements(); // refresh agreements to show the signed document
        } catch (err) {
          console.error("Signature save error:", err);
          setError("Could not save signature. Please try again.");
        }
      } else {
        setError("Please provide a signature before saving.");
      }
    };

    // Function to handle the download completion
    const handleDownloadComplete = async (agreementId) => {
      try {
        const response = await fetch(`/api/Aggrements/${agreementId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'downloaded',
            downloadedAt: new Date().toISOString(),
          }),
        });
        if (!response.ok) {
          throw new Error(
            `Failed to update agreement status (Status: ${response.status}).`
          );
        }
        fetchAgreements();
      } catch (err) {
        console.error('Download update error:', err);
        setError('Could not update agreement status after download.');
      }
    };

    if (loading) {
      return (
        <div className="text-center p-6 text-gray-500">Loading agreements...</div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-6 text-red-500">Error: {error}</div>
      );
    }

    return (
      <div className="flex flex-col items-center p-6 bg-white shadow-xl rounded-2xl max-w-4xl mx-auto">
        {/* State: No Agreement */}
        {!userAgreement && (
          <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-xl max-w-md w-full">
            <p className="text-blue-800 text-lg mb-6">
              You don't have an agreement yet.
            </p>
            <button
              onClick={handleRequestAgreement}
              className="bg-blue-600 text-white px-8 py-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 font-semibold text-lg animate-pulse"
            >
              Request New Agreement
            </button>
            <p className="mt-4 text-gray-500 text-sm">
              Please note: You can only have one pending request at a time.
            </p>
          </div>
        )}
        
        {/* State: Agreement Pending */}
        {userAgreement && userAgreement.status === 'pending' && (
          <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-xl max-w-md w-full">
            <h4 className="text-xl font-semibold text-yellow-800 mb-2">
              Agreement Request Sent
            </h4>
            <p className="text-yellow-700">
              Thank you for your request! Your agreement is being prepared. You will be notified when it's ready to sign.
            </p>
            <p className="mt-4 text-gray-500 text-sm">
              Please check back here later.
            </p>
          </div>
        )}

        {/* State: Agreement Created (Needs Signing) */}
        {userAgreement && userAgreement.status === 'created' && (
          <div className="w-full">
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl mb-6 shadow-sm">
              <h4 className="text-xl font-semibold text-green-800 mb-2">
                Agreement is Ready to Sign
              </h4>
              <p className="text-green-700">
                Please review the document below and provide your signature.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* The wrapper div now has a dynamic height for better mobile responsiveness */}
              <div className="w-full lg:w-1/2 p-4 bg-gray-100 rounded-xl h-[600px] lg:h-[600px]">
                <h4 className="text-xl font-semibold mb-4 text-gray-800">
                  PDF Preview
                </h4>
                <PDFClientSideWrapper
                  userAgreement={userAgreement}
                  handleDownloadComplete={handleDownloadComplete}
                />
              </div>

              <div className="w-full lg:w-1/2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="text-xl font-semibold text-blue-800 mb-4">
                  E-Signature
                </h4>
                <p className="text-blue-800 text-sm mb-2">
                  Please use your mouse or finger to sign below.
                </p>
                <div className="border border-gray-300 bg-white rounded-md p-2 mb-4 w-full h-[200px]">
                  {isClient && (
                    <SignatureCanvas
                      penColor='black'
                      canvasProps={{ className: 'sigCanvas w-full h-full' }}
                      ref={signatureRef}
                      onEnd={handleSignatureEnd}
                    />
                  )}
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleClearSignature}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSaveSignature}
                    disabled={!isSignaturePresent}
                    className={`px-4 py-2 rounded-full transition-colors shadow-md ${isSignaturePresent ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                  >
                    Submit Signature
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State: Agreement Signed (Ready for Download) */}
        {userAgreement && (userAgreement.status === 'signed' || userAgreement.status === 'downloaded') && (
          <div className="w-full">
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl mb-6 shadow-sm">
              <h4 className="text-xl font-semibold text-blue-800 mb-2">
                Agreement Signed Successfully
              </h4>
              <p className="text-blue-700">
                Your agreement has been signed. You can now download the complete PDF.
              </p>
            </div>
            <PDFClientSideWrapper
              userAgreement={userAgreement}
              handleDownloadComplete={handleDownloadComplete}
            />
          </div>
        )}
      </div>
    );
  };

  export default UserAggrement;
