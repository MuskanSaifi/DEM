'use client';
import React, { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AllRecordings = () => {
  const [supportPeople, setSupportPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');

  const [selectedPersonId, setSelectedPersonId] = useState('');
const [selectedRecordingUrl, setSelectedRecordingUrl] = useState('');

const [newmessage, setNewmessage]= useState('')

useEffect(() => {
    const fetchSupportPeople = async () => {
      try {
        const response = await fetch('/api/adminprofile/recordings');
        const result = await response.json();
        if (result.success) {
          setSupportPeople(result.data);
        }
      } catch (err) {
        console.error('Error fetching support people:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSupportPeople();
}, []);

const handleDelete = async (recordingId, supportPersonId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This recording will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/recordings?id=${recordingId}&supportPersonId=${supportPersonId}`, {
          method: 'DELETE',
        });
        const response = await res.json();

        if (response.success) {
          toast.success(response.message || 'Recording deleted');
          setSupportPeople(prev =>
            prev.map(person =>
              person._id === supportPersonId
                ? { ...person, recordingurl: person.recordingurl.filter(r => r._id !== recordingId) }
                : person
            )
          );
        } else {
          toast.error(response.message || 'Failed to delete recording');
        }
      } catch (error) {
        toast.error('Error deleting recording');
      }
    }
};

const handleMessageUpdate = async () => {
  if (!newmessage.trim()) {
    toast.error('Message cannot be empty');
    return;
  }

  try {
    const res = await fetch('/api/adminprofile/recordings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supportPersonId: selectedPersonId,
        recordingUrl: selectedRecordingUrl,
        text: newmessage,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success('Message sent successfully!');
      setSelectedMessage(prev => [
        ...prev,
        {
          text: newmessage,
          sentAt: new Date().toISOString(),
          type: 'admin',
        },
      ]);
      setNewmessage('');
    } else {
      toast.error(data.error || 'Something went wrong.');
    }
  } catch (err) {
    console.error(err);
    toast.error('Error adding message');
  }
};



const handleOpenModal = (
  messages = [],
  adminmessages = [],
  supportPersonId = '',
  recordingUrl = ''
) => {
  const combined = [
    ...messages.map(msg => ({ ...msg, type: 'user' })),
    ...adminmessages.map(msg => ({ ...msg, type: 'admin' })),
  ];

  combined.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

  setSelectedMessage(combined);
  setSelectedPersonId(supportPersonId);
  setSelectedRecordingUrl(recordingUrl);
  setShowModal(true);
};


const handleCloseModal = () => {
  setShowModal(false);
  setSelectedMessage([]); // should reset to an empty array, not empty string
};


if (loading) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-12">
        All Recordings
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(6).fill().map((_, i) => (
          <div
            key={i}
            className="bg-white/90 border border-gray-200 rounded-2xl shadow-lg p-6 animate-pulse"
          >
            <div className="w-full h-4 bg-gray-300 rounded mb-2"></div>
            <div className="w-2/3 h-3 bg-gray-200 rounded mb-4"></div>

            <div className="w-24 h-4 bg-purple-200 rounded mb-4"></div>

            <div className="space-y-3">
              {Array(2).fill().map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="w-40 h-3 bg-gray-200 rounded"></div>
                  <div className="w-full h-10 bg-gray-100 rounded"></div>
                  <div className="flex justify-between">
                    <div className="w-24 h-8 bg-blue-200 rounded"></div>
                    <div className="w-32 h-8 bg-red-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-12">
        All Recordings
      </h2>

      {supportPeople.length === 0 ? (
        <p className="text-gray-400 italic text-center text-lg">No recordings found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {supportPeople.map((person) => (
            <div
              key={person._id}
              className="relative group bg-white/90 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl p-6"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl"></div>

              <div className="flex flex-row justify-between items-center gap-1 text-center mb-2">
                <p className="text-xl font-semibold text-gray-800">{person.name}</p>
                <p className="text-sm text-gray-500">{person.email}</p>
              </div>

              <p className="text-md font-medium text-purple-600 mb-2">Recording(s):</p>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100">
                {person.recordingurl?.length > 0 ? (
                  person.recordingurl.map((recording) => (
                    <div key={recording._id} className="space-y-1 border-b pb-2">
                      <p className="text-xs text-gray-500 mb-0">
                        Uploaded on:{' '}
                        {new Date(recording.uploadTime).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                      <audio
                        controls
                        src={recording.url}
                        className="w-full border border-purple-300 rounded-md"
                      />
                      <div className="flex justify-between items-center p-2">
                        {recording.messages && (
                          <button
                            onClick={() => handleOpenModal(recording.messages, recording.adminmessages, person._id, recording.url.replace(/,+$/, '') )}
                            className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
                          >
                            View Message {recording.messages.length + recording.adminmessages.length}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(recording._id, person._id)}
                          className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded"
                        >
                          Delete Recording
                        </button>


                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic text-sm">No recordings available</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Viewing Messages */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative bg-white p-4 rounded-xl shadow-xl max-w-md w-full mx-4 animate-fade-in flex flex-col h-[90vh]">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={22} />
            </button>
            <h2 className="text-lg font-bold text-purple-700 mb-4">Messages</h2>


<div className="flex-1 overflow-y-auto space-y-3 pr-2">
  {Array.isArray(selectedMessage) && selectedMessage.length > 0 ? (
    selectedMessage.map((msg, idx) => (
      <div
        key={msg._id || idx}
        className={`flex flex-col ${
          msg.type === 'admin' ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`w-100 p-3 rounded-xl max-w-[90%] common-shad text-sm whitespace-pre-wrap
            ${
              msg.type === 'admin'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-gray-800'
            }`}
        >
          {msg.text}
          <span className="text-[11px] text-gray-500 mt-1 ml-2 block">
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
          </span>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-500 italic text-sm">No messages found.</p>
  )}
</div>

<form
  onSubmit={(e) => {
    e.preventDefault();
    handleMessageUpdate();
  }}
  className="mt-4 flex items-center gap-2"
>
  <input
    type="text"
    placeholder="Type your message..."
    value={newmessage}
    onChange={(e) => setNewmessage(e.target.value)}
    className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
  />
  <button
    type="submit"
    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
  >
    Send
  </button>
</form>


          </div>
        </div>
      )}

      
    </div>
  );
};

export default AllRecordings;
