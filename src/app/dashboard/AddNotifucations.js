'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaBell, FaPaperPlane, FaSearch, FaSortAmountDownAlt } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';

const AddNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'title-asc'

  // Fetch all notifications
  const fetchNotifications = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get('/api/admin/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Sending notification...');

    try {
      const res = await axios.post('/api/admin/notifications', { title, message });

      if (res.data.success) {
        toast.success('Notification sent successfully!', { id: toastId });
        setTitle('');
        setMessage('');
        fetchNotifications();
      } else {
        toast.error('❌ Failed to send', { id: toastId });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || '❌ Server error', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Memoized and filtered/sorted list of notifications
  const filteredAndSortedNotifications = useMemo(() => {
    let filteredList = notifications.filter(
      (notif) =>
        notif.title.toLowerCase().includes(filterText.toLowerCase()) ||
        notif.message.toLowerCase().includes(filterText.toLowerCase())
    );

    // Sort based on the selected order
    if (sortOrder === 'newest') {
      filteredList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'oldest') {
      filteredList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOrder === 'title-asc') {
      filteredList.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return filteredList;
  }, [notifications, filterText, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Notification Center
          </h1>
          <p className="mt-2 text-md text-gray-600 dark:text-gray-400">
            Broadcast messages and announcements to all mobile app users.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: Send Notification Form */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center mb-6">
              <FaPaperPlane className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Send a New Notification</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter notification message"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:focus:ring-offset-gray-800 transition duration-150"
              >
                {loading ? (
                  <>
                    <CgSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Send Notification
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Notifications List */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center mb-4 sm:mb-0">
                <FaBell className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Notification History</h3>
              </div>
              {isFetching && <CgSpinner className="animate-spin text-gray-400 dark:text-gray-500 h-6 w-6" />}
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title or message..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSortAmountDownAlt className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title-asc">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Conditional Rendering for Loading, Empty, and Data */}
            {isFetching ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <Skeleton height={20} width={`60%`} className="mb-2" />
                    <Skeleton height={15} count={2} />
                  </div>
                ))}
              </div>
            ) : filteredAndSortedNotifications.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p>No notifications found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {filteredAndSortedNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg p-3 transition-all duration-200 hover:shadow-md hover:border-blue-300"
                  >
                    <div className="flex justify-between items-start flex-wrap">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white break-words max-w-[70%]">{notif.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNotifications;