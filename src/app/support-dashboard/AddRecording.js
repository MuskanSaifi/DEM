'use client';

import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AddRecording = ({ supportPersonId }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchMessage, setSearchMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [newMessages, setNewMessages] = useState({});


  const fileInputRef = useRef(null);

  useEffect(() => {
    if (supportPersonId) {
      fetchRecordings();
    }
  }, [supportPersonId]);

  const fetchRecordings = async () => {
    try {
      const res = await fetch(`/api/recordings?supportPersonId=${supportPersonId}`);
      if (!res.ok) throw new Error('Failed to fetch recordings');
      const data = await res.json();
      setRecordings(data.files || []);
    } catch (error) {
      toast.error('Failed to fetch recordings');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file || !supportPersonId) {
      return toast.error('Please select a file');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('supportPersonId', supportPersonId);
      formData.append('message', message);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || 'File uploaded successfully');
        setFile(null);
          fileInputRef.current.value = ''; // Reset the input
        setMessage('');
        fetchRecordings();
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = async (recordingId) => {
  //   const result = await Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'This recording will be permanently deleted.',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#3085d6',
  //     confirmButtonText: 'Yes, delete it!',
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       const res = await fetch(`/api/recordings?id=${recordingId}&supportPersonId=${supportPersonId}`, {
  //         method: 'DELETE',
  //       });
  //       const response = await res.json();
  //       if (response.success) {
  //         toast.success(response.message || 'Recording deleted');
  //         fetchRecordings();
  //       } else {
  //         toast.error(response.message || 'Failed to delete recording');
  //       }
  //     } catch (error) {
  //       toast.error('Error deleting recording');
  //     }
  //   }
  // };


const handleMessageUpdate = async (supportPersonId, recordingUrl, messageText) => {
  if (!messageText) return;

  try {
    const res = await fetch('/api/recordings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supportPersonId,
        recordingUrl,
        text: messageText,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success('Message added successfully!');
      fetchRecordings();
      setNewMessages((prev) => ({ ...prev, [recordingUrl]: '' })); // clear input
    } else {
      toast.error(data.error || 'Something went wrong.');
    }
  } catch (err) {
    console.error(err);
    toast.error('Error adding message');
  }
};


const filteredRecordings = recordings.filter((rec) => {
  const msgMatch = rec.messages?.some(msg =>
    msg.text.toLowerCase().includes(searchMessage.toLowerCase())
  ) ?? true;

  const tagMatch = selectedTag ? rec.tag === selectedTag : true;
  const dateMatch = selectedDate
    ? new Date(rec.uploadTime).toDateString() === new Date(selectedDate).toDateString()
    : true;

  return msgMatch && tagMatch && dateMatch;
});


  const getTagStyle = (tag) => {
    switch (tag) {
      case 'genuine':
        return 'bg-green-100 text-green-800 border border-green-400';
      case 'fake':
        return 'bg-red-100 text-red-800 border border-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  if (!supportPersonId) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600 font-semibold">Please select a support person first.</p>
      </div>
    );
  }

  return (

<div className="p-6 max-w-7xl mx-auto bg-white shadow-lg rounded-xl mt-6 mb-6 border border-gray-200 ">
  <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 ">Uploaded Recordings</h1>
  <div className="flex flex-col lg:flex-row gap-6">

   {/* LEFT COLUMN */}
<div className="w-full lg:w-1/3 space-y-8 self-start ">

<div className='sticky top-5'>
  {/* Upload Section */}
  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow border border-gray-200 ">
    <h2 className="text-xl font-semibold text-blue-800 mb-2">Upload Recording</h2>

    <label className="block text-sm text-gray-700 font-medium mb-1">Select Audio File</label>
    <input
      type="file"
      accept=".mp3, .mpeg, .mpg, .amr, audio/*"
      onChange={handleFileChange}
      ref={fileInputRef}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm file:mr-3 file:bg-blue-100 file:text-blue-800 file:rounded file:px-3 file:py-1 file:border-0"
    />

    <label className="block text-sm text-gray-700 font-medium mt-3 mb-1">Message</label>
    <textarea
      placeholder="Enter a short message..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className="w-full border border-gray-300 rounded-lg p-3 h-14 text-sm shadow-sm resize-none"
    />

    <button
      onClick={uploadFile}
      disabled={loading}
      className="mt-4 bg-blue-600 text-white w-full py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
    >
      {loading ? 'Uploading...' : 'Upload Recording'}
    </button>
  </div>

  {/* Filters Section */}
  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow border border-gray-200 mt-2">
    <h2 className="text-xl font-semibold text-blue-800 mb-2">Filters</h2>

    <label className="block text-sm text-gray-700 font-medium mb-1">Search by Message</label>
    <input
      type="text"
      placeholder="Search message"
      value={searchMessage}
      onChange={(e) => setSearchMessage(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm"
    />

    <label className="block text-sm text-gray-700 font-medium mt-3 mb-1">Filter by Tag</label>
    <select
      value={selectedTag}
      onChange={(e) => setSelectedTag(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm"
    >
      <option value="">All Tags</option>
      <option value="genuine">Genuine</option>
      <option value="fake">Fake</option>
      <option value="other">Other</option>
    </select>

    <label className="block text-sm text-gray-700 font-medium mt-3 mb-1">Filter by Date</label>
    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm"
    />

    <button
      onClick={() => {
        setSearchMessage('');
        setSelectedTag('');
        setSelectedDate('');
      }}
      className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg w-full transition"
    >
      Reset Filters
    </button>
  </div>

</div>
</div>

{/* RIGHT COLUMN */}
<div className="w-full lg:w-2/3">

  {loading ? (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="p-4 bg-white rounded-xl shadow border space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton width={120} height={16} />
            <Skeleton width={60} height={20} />
          </div>
          <Skeleton height={32} />
          <Skeleton count={2} height={18} />
          <div className="flex items-center gap-2 mt-2">
            <Skeleton width={'100%'} height={32} />
            <Skeleton circle width={40} height={32} />
          </div>
        </div>
      ))}
    </div>
  ) : filteredRecordings.length === 0 ? (
    <p className="text-gray-500 italic">No recordings found.</p>
  ) : (
    <div className="h-[520px] overflow-y-auto pr-2 space-y-6">
      {filteredRecordings.map((rec, i) => (
        <div
          key={rec._id || i}
          className="p-3 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition"
        >
          {/* Metadata */}
          <p className="text-sm text-gray-600 mb-2 flex items-center justify-between">
            <span>{new Date(rec.uploadTime).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
              ${rec.tag === 'genuine' ? 'bg-green-100 text-green-800' :
                rec.tag === 'fake' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'}`}>
              {rec.tag || 'Other'}
            </span>
          </p>

          <audio controls src={rec.url} className="w-full mb-2 rounded" />

          {/* Messages */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl z-10">
              <div className="space-y-2 max-h-[200px] overflow-y-auto p-2">
                {(() => {
                  const combinedMessages = [
                    ...(rec.messages || []).map(msg => ({ ...msg, type: 'user' })),
                    ...(rec.adminmessages || []).map(msg => ({ ...msg, type: 'admin' })),
                  ];
                  combinedMessages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

                  return combinedMessages.length > 0 ? (
                    combinedMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.type === 'admin' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] text-sm px-4 py-2 rounded-2xl shadow-md whitespace-pre-wrap
                            ${msg.type === 'admin'
                              ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                              : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                            }`}
                        >
                          <div>{msg.text}</div>
                          <div className="text-[11px] text-gray-500 mt-1 text-right">
                            {msg.sentAt
                              ? new Date(msg.sentAt).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-2 rounded shadow-sm">
                      <strong>No messages</strong>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Send Message Input */}
          <div className="mt-3 flex gap-2 items-center bg-gray-50 p-3 rounded-xl shadow-sm">
            <input
              type="text"
              placeholder="Type a new message..."
              value={newMessages[rec.url] || ''}
              onChange={(e) =>
                setNewMessages((prev) => ({ ...prev, [rec.url]: e.target.value }))
              }
              className="flex-grow px-4 py-2 w-100 text-sm border border-gray-300 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={() =>
                handleMessageUpdate(supportPersonId, rec.url, newMessages[rec.url])
              }
              className="px-5 py-2 text-sm text-white bg-green-500 hover:bg-green-600 rounded-full shadow"
            >
              Send
            </button>
          </div>

        </div>
      ))}
    </div>
  )}
</div>
  </div>
</div>

  );
};

export default AddRecording;
