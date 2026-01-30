// src/pages/FeedbackDashboard.jsx - Updated with photo display
import { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    today: 0,
    withPhotos: 0
  });
  const [expandedFeedback, setExpandedFeedback] = useState(null);

  // Fetch all feedback
  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [feedbacks, searchQuery, filterStatus]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching feedback from:', `${import.meta.env.VITE_API_URL}/feedback`);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/feedback`);
      
      console.log('📦 Feedback API Response:', response.data);
      console.log('📊 Response success:', response.data.success);
      console.log('📊 Feedback count:', response.data.count);
      
      if (response.data.success) {
        const feedbacksData = response.data.feedbacks || [];
        console.log('📊 First feedback:', feedbacksData[0]);
        console.log('📊 Has photo in first feedback:', feedbacksData[0]?.photo ? 'Yes' : 'No');
        
        setFeedbacks(feedbacksData);
        setFilteredFeedbacks(feedbacksData);
        console.log(`✅ Loaded ${feedbacksData.length} feedback entries`);
      } else {
        console.error('❌ Failed to fetch feedbacks');
        setFeedbacks([]);
        setFilteredFeedbacks([]);
      }
    } catch (err) {
      console.error('❌ Error fetching feedbacks:', err);
      setFeedbacks([]);
      setFilteredFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/feedback/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedbacks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(feedback =>
        (feedback.propertyTitle && feedback.propertyTitle.toLowerCase().includes(query)) ||
        (feedback.feedback && feedback.feedback.toLowerCase().includes(query)) ||
        (feedback.propertyDetails?.ownerName && feedback.propertyDetails.ownerName.toLowerCase().includes(query)) ||
        (feedback.propertyId && feedback.propertyId.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(feedback => feedback.status === filterStatus);
    }

    setFilteredFeedbacks(filtered);
  };

  const updateStatus = async (feedbackId, newStatus) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/feedback/${feedbackId}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        setFeedbacks(prev => 
          prev.map(fb => 
            fb._id === feedbackId 
              ? { ...fb, status: newStatus } 
              : fb
          )
        );
        fetchStats();
        alert(`Feedback marked as ${newStatus}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/feedback/${feedbackId}`
      );

      if (response.data.success) {
        setFeedbacks(prev => prev.filter(fb => fb._id !== feedbackId));
        fetchStats();
        alert('Feedback deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <span className="text-yellow-500">⏰</span>;
      case 'reviewed':
        return <span className="text-blue-500">👁️</span>;
      case 'resolved':
        return <span className="text-green-500">✅</span>;
      default:
        return <span className="text-gray-500">💬</span>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpandFeedback = (feedbackId) => {
    setExpandedFeedback(expandedFeedback === feedbackId ? null : feedbackId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Total Feedback</h3>
            <span className="text-2xl text-blue-500">💬</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">All time</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Pending</h3>
            <span className="text-2xl text-yellow-500">⏰</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-gray-500 mt-1">Needs review</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Reviewed</h3>
            <span className="text-2xl text-blue-500">👁️</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.reviewed}</div>
          <div className="text-xs text-gray-500 mt-1">Under consideration</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Resolved</h3>
            <span className="text-2xl text-green-500">✅</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-xs text-gray-500 mt-1">Completed</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Today</h3>
            <span className="text-2xl text-purple-500">📅</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">{stats.today}</div>
          <div className="text-xs text-gray-500 mt-1">New today</div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">With Photos</h3>
            <span className="text-2xl text-pink-500">📷</span>
          </div>
          <div className="text-3xl font-bold text-pink-600">{stats.withPhotos || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Includes images</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feedback by property, owner, or content..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">⚙️</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <button
              onClick={fetchFeedbacks}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <span className="mr-2">🔄</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading feedback...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl text-gray-300 mb-4">💬</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Feedback Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No feedback has been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property & Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeedbacks.map((feedback) => (
                  <tr key={feedback._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {feedback.propertyTitle || 'Unknown Property'}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span className="mr-1">👤</span>
                          {feedback.propertyDetails?.ownerName || 'Unknown Owner'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {feedback.propertyId?.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <button
                          onClick={() => toggleExpandFeedback(feedback._id)}
                          className="text-left w-full hover:text-blue-600 transition-colors"
                        >
                          <p className="text-gray-800 line-clamp-2">
                            {feedback.feedback}
                          </p>
                          {expandedFeedback === feedback._id && (
                            <div className="mt-2 text-sm text-gray-600">
                              {feedback.feedback}
                            </div>
                          )}
                          <span className="text-xs text-blue-500 mt-1 inline-block">
                            {expandedFeedback === feedback._id ? 'Show less' : 'Show more...'}
                          </span>
                        </button>
                        {feedback.propertyDetails && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">Details:</span>{' '}
                            {feedback.propertyDetails.bhk || 'N/A'} • 
                            ₹{feedback.propertyDetails.rent?.toLocaleString() || '0'} • 
                            {feedback.propertyDetails.type || 'N/A'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {feedback.photo ? (
                        <div className="relative group">
                          <img
                            src={feedback.photo}
                            alt="Feedback photo"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              // Open photo in modal or new tab
                              window.open(feedback.photo, '_blank');
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100">📷 View</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            Has photo
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-gray-400 text-2xl">📷</span>
                          <div className="text-xs text-gray-500 mt-1">
                            No photo
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(feedback.status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(feedback.status)}`}>
                          {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(feedback.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          {feedback.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(feedback._id, 'reviewed')}
                              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex-1"
                            >
                              Mark Reviewed
                            </button>
                          )}
                          {feedback.status === 'reviewed' && (
                            <button
                              onClick={() => updateStatus(feedback._id, 'resolved')}
                              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors flex-1"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => deleteFeedback(feedback._id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <span className="mr-1">🗑️</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
        <div>
          Showing {filteredFeedbacks.length} of {feedbacks.length} feedback entries
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-full mr-2"></span>
            <span>Pending: {feedbacks.filter(f => f.status === 'pending').length}</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-full mr-2"></span>
            <span>Reviewed: {feedbacks.filter(f => f.status === 'reviewed').length}</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-100 border border-green-300 rounded-full mr-2"></span>
            <span>Resolved: {feedbacks.filter(f => f.status === 'resolved').length}</span>
          </div>
        </div>
      </div>

      {/* Photo Gallery View (Optional) */}
      {feedbacks.filter(f => f.photo).length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Photo Gallery ({feedbacks.filter(f => f.photo).length} photos)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {feedbacks.filter(f => f.photo).map((feedback, index) => (
              <div key={feedback._id} className="relative group">
                <img
                  src={feedback.photo}
                  alt={`Feedback ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => window.open(feedback.photo, '_blank')}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {feedback.propertyTitle?.substring(0, 15)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackDashboard;