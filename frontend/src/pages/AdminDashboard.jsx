import { useState, useEffect } from 'react';
import PropertyForm from '../components/PropertyForm';
import PropertyList from '../components/PropertyList';
import FeedbackDashboard from './FeedbackDashboard'; // Import the FeedbackDashboard
import axios from 'axios';

const AdminDashboard = ({ adminEmail }) => {
  const [activeTab, setActiveTab] = useState('add');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/properties/my-creations/${adminEmail}`
      );
      
      if (response.data.success) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-creations') {
      fetchProperties();
    }
  }, [activeTab]);

  const handlePropertyAdded = () => {
    fetchProperties();
    setEditingProperty(null);
    setActiveTab('my-creations'); // Switch to My Creations tab
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/properties/delete/${id}`
        );
        fetchProperties();
      } catch (err) {
        console.error('Error deleting property:', err);
        alert('Failed to delete property');
      }
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setActiveTab('add'); // Switch to Add tab for editing
  };

  const handleCancelEdit = () => {
    setEditingProperty(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 fade-in">
      {/* Welcome Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold gradient-text mb-3">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome back, <span className="font-semibold text-blue-600">{adminEmail}</span>
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Three Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Add/Edit Property Button */}
        <button
          onClick={() => {
            setActiveTab('add');
            if (editingProperty) setEditingProperty(null);
          }}
          className={`modern-card p-6 text-center transition-all duration-300 group ${
            activeTab === 'add' 
              ? 'ring-2 ring-blue-500 shadow-xl' 
              : 'hover:shadow-xl'
          }`}
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
            activeTab === 'add'
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'
              : 'bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300'
          }`}>
            <span className={`text-2xl ${
              activeTab === 'add' ? 'text-white' : 'text-blue-600'
            }`}>
              {editingProperty ? '✏️' : '➕'}
            </span>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            activeTab === 'add' ? 'text-blue-600' : 'text-gray-800'
          }`}>
            {editingProperty ? 'Editing Property' : 'Add New Property'}
          </h3>
          <p className="text-gray-600 text-sm">
            {editingProperty ? 'Update property details' : 'List a new property for rent or lease'}
          </p>
        </button>

        {/* My Creations Button */}
        <button
          onClick={() => {
            setActiveTab('my-creations');
            setEditingProperty(null);
            fetchProperties();
          }}
          className={`modern-card p-6 text-center transition-all duration-300 group ${
            activeTab === 'my-creations' 
              ? 'ring-2 ring-green-500 shadow-xl' 
              : 'hover:shadow-xl'
          }`}
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
            activeTab === 'my-creations'
              ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg'
              : 'bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300'
          }`}>
            <span className={`text-2xl ${
              activeTab === 'my-creations' ? 'text-white' : 'text-green-600'
            }`}>📋</span>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            activeTab === 'my-creations' ? 'text-green-600' : 'text-gray-800'
          }`}>
            My Creations
          </h3>
          <p className="text-gray-600 text-sm">
            View and manage your listed properties
          </p>
          {properties.length > 0 && (
            <div className="mt-2">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                {properties.length} properties
              </span>
            </div>
          )}
        </button>

        {/* Feedback List Button - MODIFIED TO BE CLICKABLE */}
        <button
          onClick={() => {
            setActiveTab('feedback');
            setEditingProperty(null);
          }}
          className={`modern-card p-6 text-center transition-all duration-300 group ${
            activeTab === 'feedback' 
              ? 'ring-2 ring-yellow-500 shadow-xl' 
              : 'hover:shadow-xl'
          }`}
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
            activeTab === 'feedback'
              ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg'
              : 'bg-gradient-to-br from-yellow-100 to-yellow-200 group-hover:from-yellow-200 group-hover:to-yellow-300'
          }`}>
            <span className={`text-2xl ${
              activeTab === 'feedback' ? 'text-white' : 'text-yellow-600'
            }`}>💬</span>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            activeTab === 'feedback' ? 'text-yellow-600' : 'text-gray-800'
          }`}>
            Feedback List
          </h3>
          <p className="text-gray-600 text-sm">
            View feedback from tenants
          </p>
          <div className="mt-3">
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
              activeTab === 'feedback' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {activeTab === 'feedback' ? 'Active' : 'Click to View'}
            </span>
          </div>
        </button>
      </div>

      {/* Dynamic Content */}
      <div className="mt-8 slide-up">
        {/* Add/Edit Property Form */}
        {activeTab === 'add' && (
          <PropertyForm 
            adminEmail={adminEmail} 
            onPropertyAdded={handlePropertyAdded}
            editProperty={editingProperty}
            onCancelEdit={handleCancelEdit}
          />
        )}

        {/* My Creations List */}
        {activeTab === 'my-creations' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  My Properties
                </h2>
                <p className="text-gray-600">
                  Properties listed by you
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Total: <span className="font-bold text-blue-600">{properties.length}</span>
                </span>
                <button
                  onClick={fetchProperties}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <span className="mr-1">🔄</span>
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-inner">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
                  <span className="text-4xl text-blue-500">🏠</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No Properties Yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You haven't added any properties yet. Start by adding your first property!
                </p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="btn-primary px-8 py-3"
                >
                  ➕ Add Your First Property
                </button>
              </div>
            ) : (
              <PropertyList 
                properties={properties} 
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )}
          </div>
        )}

        {/* Feedback Dashboard */}
        {activeTab === 'feedback' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Feedback Dashboard</h2>
                <p className="text-gray-600">Manage and review all property feedback</p>
              </div>
              <button
                onClick={() => setActiveTab('my-creations')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors flex items-center"
              >
                <span className="mr-2">←</span>
                Back to Properties
              </button>
            </div>
            <FeedbackDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;