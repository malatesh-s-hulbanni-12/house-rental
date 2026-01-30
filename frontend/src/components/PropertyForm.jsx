import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const PropertyForm = ({ adminEmail, onPropertyAdded, editProperty, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    ownerName: '',
    rent: '',
    advance: '',
    type: 'Rent',
    bhk: '1 BHK',
    squareFeet: '',
    phoneNumber: '',
    photos: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // If editProperty is provided, populate form with its data
  useEffect(() => {
    if (editProperty) {
      setFormData({
        ownerName: editProperty.ownerName || '',
        rent: editProperty.rent || '',
        advance: editProperty.advance || '',
        type: editProperty.type || 'Rent',
        bhk: editProperty.bhk || '1 BHK',
        squareFeet: editProperty.squareFeet || '',
        phoneNumber: editProperty.phoneNumber || '',
        photos: editProperty.photos || []
      });
      setImagePreviews(editProperty.photos || []);
    }
  }, [editProperty]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];
    const newPhotos = [];

    // Limit to 5 images
    const allowedFiles = files.slice(0, 5 - imagePreviews.length);

    if (allowedFiles.length === 0) {
      setMessage({ 
        type: 'error', 
        text: 'Maximum 5 photos allowed' 
      });
      return;
    }

    allowedFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setMessage({ 
          type: 'error', 
          text: 'Please upload only image files' 
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === allowedFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);

      // Convert to Base64
      const reader2 = new FileReader();
      reader2.onloadend = () => {
        newPhotos.push(reader2.result);
        if (newPhotos.length === allowedFiles.length) {
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...newPhotos]
          }));
        }
      };
      reader2.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validation
      if (!formData.ownerName || !formData.rent || !formData.advance || 
          !formData.phoneNumber || !formData.squareFeet || formData.photos.length === 0) {
        setMessage({ 
          type: 'error', 
          text: 'Please fill all required fields and upload at least one photo' 
        });
        setLoading(false);
        return;
      }

      const propertyData = {
    ownerName: formData.ownerName,
    rent: Number(formData.rent),
    advance: Number(formData.advance),
    type: formData.type,
    bhk: formData.bhk, // MAKE SURE THIS IS INCLUDED
    squareFeet: Number(formData.squareFeet), // MAKE SURE THIS IS INCLUDED
    phoneNumber: formData.phoneNumber,
    photos: formData.photos,
    adminEmail: adminEmail
};

      let response;
      
      if (editProperty) {
        // Update existing property
        response = await axios.put(
          `${import.meta.env.VITE_API_URL || 'https://house-rental-rho.vercel.app/api'}/properties/update/${editProperty._id}`,
          propertyData,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );
      } else {
        // Create new property
        response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'https://house-rental-rho.vercel.app/api'}/properties/add`,
          propertyData,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );
      }

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: editProperty 
            ? '✅ Property updated successfully!' 
            : '✅ Property added successfully!' 
        });
        
        if (!editProperty) {
          // Reset form only for new property
          setFormData({
            ownerName: '',
            rent: '',
            advance: '',
            type: 'Rent',
            bhk: '1 BHK',
            squareFeet: '',
            phoneNumber: '',
            photos: []
          });
          setImagePreviews([]);
        }
        
        // Notify parent
        if (onPropertyAdded) {
          onPropertyAdded();
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 
              (editProperty ? 'Failed to update property' : 'Failed to add property') 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text mb-2">
            {editProperty ? 'Edit Property' : 'Add New Property'}
          </h2>
          <p className="text-gray-600">
            {editProperty ? 'Update the property details' : 'Fill in the details to list your property'}
          </p>
        </div>
        
        <div className="modern-card p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {message.type === 'success' ? '✅' : '❌'}
                </span>
                <span>{message.text}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner & Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="modern-input"
                  placeholder="Enter owner's full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="modern-input"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>
            
            {/* BHK & Square Feet Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  BHK Type *
                </label>
                <select
                  name="bhk"
                  value={formData.bhk}
                  onChange={handleInputChange}
                  className="modern-select"
                  required
                >
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="5+ BHK">5+ BHK</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Square Feet (Area) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="squareFeet"
                    value={formData.squareFeet}
                    onChange={handleInputChange}
                    className="modern-input pr-10"
                    placeholder="e.g., 1200"
                    min="100"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    sq.ft
                  </span>
                </div>
              </div>
            </div>
            
            {/* Rent, Advance, Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rent Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleInputChange}
                    className="modern-input pl-10"
                    placeholder="5000"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Advance (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="advance"
                    value={formData.advance}
                    onChange={handleInputChange}
                    className="modern-input pl-10"
                    placeholder="10000"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agreement Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="modern-select"
                  required
                >
                  <option value="Rent">Rent</option>
                  <option value="Lease">Lease</option>
                </select>
              </div>
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Photos * (Max 5)
              </label>
              
              <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors duration-300 bg-gradient-to-br from-gray-50 to-white">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer block"
                >
                  <div className="py-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl text-blue-600">📸</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mb-1">
                      Drop images or click to upload
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, JPEG up to 5MB each
                    </p>
                    <button
                      type="button"
                      className="mt-4 btn-outline text-sm px-6 py-2"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Browse Files
                    </button>
                  </div>
                </label>
              </div>
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-6 slide-up">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Uploaded Photos ({imagePreviews.length}/5)
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="w-32 h-32 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-lg hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Submit/Cancel Buttons */}
            <div className="pt-4 flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 btn-primary py-4 text-lg ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    {editProperty ? 'Updating...' : 'Saving...'}
                  </div>
                ) : (
                  `📝 ${editProperty ? 'Update Property' : 'Submit Property'}`
                )}
              </button>
              
              {editProperty && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                {editProperty ? 'Updates will be saved to MongoDB database' : 
                  'Your property will be saved to MongoDB database with Base64 images'}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;