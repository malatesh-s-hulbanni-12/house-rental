import { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyList from '../components/PropertyList';

const MyCreations = ({ adminEmail }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProperty, setEditingProperty] = useState(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'https://house-rental-rho.vercel.app/api'}/properties/my-creations/${adminEmail}`
      );
      
      if (response.data.success) {
        setProperties(response.data.properties);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [adminEmail]);

  const handlePropertyAdded = () => {
    fetchProperties();
    setEditingProperty(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL || 'https://house-rental-rho.vercel.app/api'}/properties/delete/${id}`
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
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProperty(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          My Creations
        </h1>
        <p className="text-gray-600">
          Properties listed by you: <span className="font-semibold">{properties.length}</span>
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-inner">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
            <span className="text-4xl text-blue-500">🏠</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No Properties Yet
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't added any properties yet. Start by adding your first property!
          </p>
          <a
            href="/admin#add-property"
            className="inline-block btn-primary px-8 py-3"
          >
            ➕ Add Your First Property
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id} className="property-card group">
              {/* Property Image */}
              <div className="relative h-56 overflow-hidden">
                {property.photos && property.photos.length > 0 ? (
                  <>
                    <img
                      src={property.photos[0]}
                      alt={property.ownerName}
                      className="property-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">🏠</span>
                  </div>
                )}
                
                {/* Badges - Showing BHK and Type */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <span className={`badge ${
                    property.type === 'Rent' ? 'badge-rent' : 'badge-lease'
                  }`}>
                    {property.type}
                  </span>
                  <span className="badge bg-blue-100 text-blue-800">
                    {property.bhk || 'N/A'}
                  </span>
                </div>
                
                {/* Square Feet Badge */}
                <div className="absolute top-3 left-3">
                  <span className="badge bg-purple-100 text-purple-800">
                    {property.squareFeet ? `${property.squareFeet} sq.ft` : 'N/A'}
                  </span>
                </div>
                
                {/* Photo count badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                    📸 {property.photos?.length || 0}
                  </span>
                </div>
              </div>
              
              {/* Property Details */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 truncate">
                    {property.ownerName}
                  </h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Area</div>
                    <div className="text-lg font-semibold text-purple-600">
                      {property.squareFeet ? `${property.squareFeet} sq.ft` : 'N/A'}
                    </div>
                  </div>
                </div>
                
                {/* BHK and Type Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="mr-2 text-blue-600">🏘️</span>
                    <span className="font-medium">{property.bhk || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-green-600">📄</span>
                    <span className="font-medium">{property.type || 'N/A'}</span>
                  </div>
                </div>
                
                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Monthly Rent</div>
                    <div className="text-lg font-bold text-blue-600">
                      ₹{property.rent?.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Advance</div>
                    <div className="text-lg font-bold text-green-600">
                      ₹{property.advance?.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📞</span>
                    <span className="truncate text-sm">{property.phoneNumber}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📅</span>
                    <span className="text-sm">
                      {new Date(property.updatedAt || property.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleDelete(property._id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => handleEdit(property)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Form Modal */}
      {editingProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">
                  Edit Property
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {/* You would put your PropertyForm component here */}
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Edit form would appear here</p>
                <button
                  onClick={handleCancelEdit}
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCreations;