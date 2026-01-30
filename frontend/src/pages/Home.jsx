import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [feedbackPhotos, setFeedbackPhotos] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState({});
  const [filters, setFilters] = useState({
    minRent: '',
    maxRent: '',
    bhk: '',
    type: '',
    minSqft: '',
    maxSqft: ''
  });
  const [activeImageIndices, setActiveImageIndices] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [feedbackText, setFeedbackText] = useState({});
  const [submittingFeedback, setSubmittingFeedback] = useState({});

  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  
  const texts = ['HouseRental', 'Your Dream Home', 'Perfect Living Space'];
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 1500;
  
  useEffect(() => {
    const handleTyping = () => {
      const currentText = texts[loopNum % texts.length];
      
      if (!isDeleting) {
        // Typing forward
        setDisplayText(currentText.substring(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
        
        if (currentIndex === currentText.length) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting backward
        setDisplayText(currentText.substring(0, currentIndex - 1));
        setCurrentIndex(prev => prev - 1);
        
        if (currentIndex === 0) {
          setIsDeleting(false);
          setLoopNum(prev => prev + 1);
        }
      }
    };
    
    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, loopNum]);

  // Fetch all properties for home page
  useEffect(() => {
    fetchProperties();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, properties, searchQuery]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      console.log('🌐 Fetching properties from:', `${import.meta.env.VITE_API_URL || 'https://house-rental-rho.vercel.app/api'}/properties`);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://house-rental-rho.vercel.app/api'}/properties`);
      
      console.log('📦 API Response:', response.data);
      
      // FIXED: Check if response.data is an array
      if (Array.isArray(response.data)) {
        // Root route returns array directly
        setProperties(response.data);
        setFilteredProperties(response.data);
        
        // Initialize active image indices for each property
        const indices = {};
        response.data.forEach(property => {
          indices[property._id] = 0; // Start with first image
        });
        setActiveImageIndices(indices);
        
        console.log(`✅ Loaded ${response.data.length} properties`);
      } else {
        console.error('❌ API returned success: false');
        setProperties([]);
        setFilteredProperties([]);
      }
    } catch (err) {
      console.error('❌ Error fetching properties:', err);
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-slide images for each property
  useEffect(() => {
    const intervalIds = [];
    
    filteredProperties.forEach(property => {
      if (property.photos && property.photos.length > 1) {
        const intervalId = setInterval(() => {
          setActiveImageIndices(prev => {
            const currentIndex = prev[property._id] || 0;
            const nextIndex = (currentIndex + 1) % property.photos.length;
            return {
              ...prev,
              [property._id]: nextIndex
            };
          });
        }, 3000); // Change image every 3 seconds
        
        intervalIds.push(intervalId);
      }
    });
    
    // Cleanup intervals on unmount or when properties change
    return () => {
      intervalIds.forEach(id => clearInterval(id));
    };
  }, [filteredProperties]);

  const nextImage = (propertyId, totalImages) => {
    setActiveImageIndices(prev => {
      const currentIndex = prev[propertyId] || 0;
      const nextIndex = (currentIndex + 1) % totalImages;
      return {
        ...prev,
        [propertyId]: nextIndex
      };
    });
  };

  const prevImage = (propertyId, totalImages) => {
    setActiveImageIndices(prev => {
      const currentIndex = prev[propertyId] || 0;
      const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
      return {
        ...prev,
        [propertyId]: prevIndex
      };
    });
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Search by owner name, BHK, or type
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        (property.ownerName && property.ownerName.toLowerCase().includes(query)) ||
        (property.bhk && property.bhk.toLowerCase().includes(query)) ||
        (property.type && property.type.toLowerCase().includes(query)) ||
        (property.phoneNumber && property.phoneNumber.includes(query))
      );
    }

    // Apply rent filters
    if (filters.minRent) {
      filtered = filtered.filter(property => property.rent >= Number(filters.minRent));
    }
    if (filters.maxRent) {
      filtered = filtered.filter(property => property.rent <= Number(filters.maxRent));
    }

    // Apply BHK filter
    if (filters.bhk) {
      filtered = filtered.filter(property => property.bhk === filters.bhk);
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(property => property.type === filters.type);
    }

    // Apply square feet filters
    if (filters.minSqft) {
      filtered = filtered.filter(property => property.squareFeet >= Number(filters.minSqft));
    }
    if (filters.maxSqft) {
      filtered = filtered.filter(property => property.squareFeet <= Number(filters.maxSqft));
    }

    setFilteredProperties(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      minRent: '',
      maxRent: '',
      bhk: '',
      type: '',
      minSqft: '',
      maxSqft: ''
    });
    setSearchQuery('');
    setShowFilters(false);
  };

  // =============== PHOTO UPLOAD FUNCTIONS ===============
  
  // Handle photo upload for feedback
  const handlePhotoUpload = (propertyId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingPhoto(prev => ({ ...prev, [propertyId]: true }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setFeedbackPhotos(prev => ({
        ...prev,
        [propertyId]: e.target.result
      }));
      setUploadingPhoto(prev => ({ ...prev, [propertyId]: false }));
    };
    reader.onerror = () => {
      alert('Error reading file');
      setUploadingPhoto(prev => ({ ...prev, [propertyId]: false }));
    };
    reader.readAsDataURL(file);
  };

  // Remove photo from feedback
  const removePhoto = (propertyId) => {
    setFeedbackPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[propertyId];
      return newPhotos;
    });
  };

  // =============== ACTION BUTTON FUNCTIONS ===============

  // Handle Call button click
  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      // Format phone number (remove spaces, dashes, etc.)
      const formattedNumber = phoneNumber.replace(/\D/g, '');
      window.open(`tel:${formattedNumber}`, '_self');
    } else {
      alert('Phone number not available');
    }
  };

  // Handle Chat button click (WhatsApp)
  const handleChat = (phoneNumber, ownerName) => {
    if (phoneNumber) {
      // Format phone number for WhatsApp
      const formattedNumber = phoneNumber.replace(/\D/g, '');
      const message = `Hello ${ownerName}, I'm interested in your property listed on HouseRental. Can you provide more details?`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
    } else {
      alert('Phone number not available for WhatsApp');
    }
  };

  // Handle Feedback button click
  const handleFeedbackClick = (propertyId) => {
    setShowFeedback(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  // Handle Feedback text change
  const handleFeedbackChange = (propertyId, text) => {
    setFeedbackText(prev => ({
      ...prev,
      [propertyId]: text
    }));
  };

  // Submit Feedback - UPDATED WITH PHOTO SUPPORT
  const submitFeedback = async (propertyId, property) => {
    const text = feedbackText[propertyId]?.trim();
    if (!text) {
      alert('Please enter your feedback');
      return;
    }

    try {
      setSubmittingFeedback(prev => ({ ...prev, [propertyId]: true }));
      
      // Create feedback data with proper structure
      const feedbackData = {
        propertyId: propertyId.toString(),
        propertyTitle: property.ownerName || 'Unknown Property',
        feedback: text,
        photo: feedbackPhotos[propertyId] || null, // Include photo if exists
        propertyDetails: {
          ownerName: property.ownerName || '',
          rent: property.rent || 0,
          bhk: property.bhk || '',
          type: property.type || '',
          phoneNumber: property.phoneNumber || '',
          squareFeet: property.squareFeet || 0
        }
      };

      console.log('📤 Submitting feedback:', {
        propertyId: feedbackData.propertyId,
        propertyTitle: feedbackData.propertyTitle,
        feedbackLength: feedbackData.feedback.length,
        hasPhoto: !!feedbackData.photo
      });

      // Send feedback to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://house-rental-rho.vercel.app/api'}/feedback`,
        feedbackData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Feedback response:', response.data);

      if (response.data.success) {
        alert('Thank you for your feedback!');
        // Clear all feedback data
        setFeedbackText(prev => ({ ...prev, [propertyId]: '' }));
        setFeedbackPhotos(prev => {
          const newPhotos = { ...prev };
          delete newPhotos[propertyId];
          return newPhotos;
        });
        setShowFeedback(prev => ({ ...prev, [propertyId]: false }));
      } else {
        alert(`Failed to submit feedback: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error submitting feedback:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show detailed error message
      if (error.response?.data?.errors) {
        alert(`Validation error: ${error.response.data.errors.join(', ')}`);
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Error submitting feedback. Please try again.');
      }
    } finally {
      setSubmittingFeedback(prev => ({ ...prev, [propertyId]: false }));
      setUploadingPhoto(prev => ({ ...prev, [propertyId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 pt-12 pb-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Welcome to <span className="text-yellow-300">{displayText}</span>
        <span className="ml-1 animate-pulse">|</span>
      </h1>
            <div className="w-32 h-1 bg-white/50 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-white/90 mb-8">
              Find your dream home from our curated collection of premium properties.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by owner name, BHK type, or property type..."
                  className="w-full pl-12 pr-32 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-medium backdrop-blur-sm transition-all flex items-center text-sm"
                  >
                    <span className="mr-1">⚙️</span>
                    Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
       
       {/* Wave Divider with arbitrary animation */}
<div className="absolute bottom-0 left-0 right-0 overflow-hidden h-12">
  <div className="relative w-[200%] h-full">
    <svg 
      viewBox="0 0 1200 120" 
      preserveAspectRatio="none" 
      className="w-full h-full text-gray-50 animate-[wave_20s_linear_infinite]"
      style={{
        animation: 'waveMove 20s linear infinite'
      }}
    >
      <path 
        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
        fill="currentColor"
      />
    </svg>
  </div>
  
  {/* Add keyframes inline */}
  <style>{`
    @keyframes waveMove {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }
  `}</style>
</div>

        
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="container mx-auto px-4 mt-2 mb-6 slide-up">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Filter Properties</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rent Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rent Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minRent"
                    value={filters.minRent}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="number"
                    name="maxRent"
                    value={filters.maxRent}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              
              {/* BHK Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  BHK Type
                </label>
                <select
                  name="bhk"
                  value={filters.bhk}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                >
                  <option value="">All BHK</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="5+ BHK">5+ BHK</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>
              
              {/* Property Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="Rent">Rent</option>
                  <option value="Lease">Lease</option>
                </select>
              </div>
              
              {/* Square Feet Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Area (sq.ft)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minSqft"
                    value={filters.minSqft}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="number"
                    name="maxSqft"
                    value={filters.maxSqft}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Properties Section */}
      <div className="container mx-auto px-4 py-6">
        {/* Properties Count */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Available Properties
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
                {searchQuery && ` for "${searchQuery}"`}
                {Object.values(filters).some(f => f) && ' (filtered)'}
              </p>
            </div>
            
            <div className="mt-2 md:mt-0 flex items-center space-x-3">
              <button
                onClick={fetchProperties}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <span className="mr-1">🔄</span>
                Refresh
              </button>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Total: <span className="font-bold">{properties.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
            <p className="text-sm text-gray-500 mt-2">
              Checking: {import.meta.env.VITE_API_URL || 'https://house-rental-rho.vercel.app/api'}/properties
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-3xl text-gray-400">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search or filters.'
                : 'No properties available. Add properties from admin dashboard.'}
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500 bg-blue-50 p-2 rounded">
              Showing {filteredProperties.length} of {properties.length} properties
            </div>
            
            {/* Property Cards with Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => {
                const activeIndex = activeImageIndices[property._id] || 0;
                const hasMultipleImages = property.photos && property.photos.length > 1;
                
                return (
                  <div key={property._id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Image Slider Section */}
                    <div className="relative h-80 bg-gray-200 overflow-hidden">
                      {property.photos && property.photos.length > 0 ? (
                        <>
                          {/* Current Image */}
                          <img
                            src={property.photos[activeIndex]}
                            alt={`${property.ownerName} - Image ${activeIndex + 1}`}
                            className="w-full h-full object-cover transition-opacity duration-500"
                          />
                          
                          {/* Image Navigation Dots */}
                          {hasMultipleImages && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                              {property.photos.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setActiveImageIndices(prev => ({
                                    ...prev,
                                    [property._id]: index
                                  }))}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    index === activeIndex 
                                      ? 'bg-white w-4' 
                                      : 'bg-white/50 hover:bg-white/80'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Image Counter */}
                          {hasMultipleImages && (
                            <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              {activeIndex + 1} / {property.photos.length}
                            </div>
                          )}
                          
                          {/* Navigation Arrows */}
                          {hasMultipleImages && (
                            <>
                              <button
                                onClick={() => prevImage(property._id, property.photos.length)}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                              >
                                ←
                              </button>
                              <button
                                onClick={() => nextImage(property._id, property.photos.length)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                              >
                                →
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                          <span className="text-6xl text-gray-400">🏠</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Details Section */}
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 text-xl mb-3">
                        {property.ownerName || 'Unknown Owner'}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-sm">
                          <span className="text-gray-600 font-medium">BHK:</span>
                          <span className="font-bold text-gray-800 ml-2 text-base">
                            {property.bhk || 'N/A'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600 font-medium">Area:</span>
                          <span className="font-bold text-gray-800 ml-2 text-base">
                            {property.squareFeet ? `${property.squareFeet} sq.ft` : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                          <div className="text-sm text-gray-600">Monthly Rent:</div>
                          <div className="font-bold text-blue-700 text-lg">
                            ₹{property.rent?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                          <div className="text-sm text-gray-600">Advance:</div>
                          <div className="font-bold text-green-700 text-lg">
                            ₹{property.advance?.toLocaleString() || '0'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-4">
                        <div className="flex items-center text-gray-700 font-medium">
                          <span className="mr-2 text-lg">📞</span>
                          <span className="text-sm">{property.phoneNumber || 'N/A'}</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                          property.type === 'Rent' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {property.type || 'N/A'}
                        </div>
                      </div>

                      {/* ACTION BUTTONS SECTION */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between space-x-2 mb-3">
                          {/* Call Button */}
                          <button
                            onClick={() => handleCall(property.phoneNumber)}
                            disabled={!property.phoneNumber}
                            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all ${
                              property.phoneNumber 
                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <span className="mr-2">📞</span>
                            Call
                          </button>
                          
                          {/* Chat/WhatsApp Button */}
                          <button
                            onClick={() => handleChat(property.phoneNumber, property.ownerName)}
                            disabled={!property.phoneNumber}
                            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all ${
                              property.phoneNumber 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <span className="mr-2">💬</span>
                            WhatsApp
                          </button>
                          
                          {/* Feedback Button */}
                          <button
                            onClick={() => handleFeedbackClick(property._id)}
                            className="flex-1 flex items-center justify-center py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
                          >
                            <span className="mr-2">⭐</span>
                            Feedback
                          </button>
                        </div>

                        {/* Feedback Input Section with Photo Upload */}
                        {showFeedback[property._id] && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Feedback
                              </label>
                              <textarea
                                value={feedbackText[property._id] || ''}
                                onChange={(e) => handleFeedbackChange(property._id, e.target.value)}
                                placeholder="Share your feedback about this property. What did you like? Any suggestions?"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 resize-none"
                                rows="3"
                              />
                              
                              {/* Photo Upload Section */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-sm font-medium text-gray-700">
                                    Attach Photo (Optional)
                                  </label>
                                  <span className="text-xs text-gray-500">Max 5MB</span>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  {/* Hidden file input */}
                                  <input
                                    type="file"
                                    id={`feedback-photo-${property._id}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload(property._id, e)}
                                  />
                                  
                                  {/* Upload button */}
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`feedback-photo-${property._id}`).click()}
                                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <span className="mr-2 text-blue-500">📷</span>
                                    <span className="text-sm font-medium text-gray-700">Upload Photo</span>
                                  </button>
                                  
                                  {/* Loading indicator */}
                                  {uploadingPhoto[property._id] && (
                                    <div className="text-sm text-gray-600">Uploading...</div>
                                  )}
                                  
                                  {/* Photo preview (if uploaded) */}
                                  {feedbackPhotos[property._id] && !uploadingPhoto[property._id] && (
                                    <div className="relative">
                                      <img
                                        src={feedbackPhotos[property._id]}
                                        alt="Feedback photo preview"
                                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removePhoto(property._id)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                              <div className="text-xs text-gray-500">
                                Your feedback will be visible to admin only
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setShowFeedback(prev => ({ ...prev, [property._id]: false }));
                                    setFeedbackText(prev => ({ ...prev, [property._id]: '' }));
                                    removePhoto(property._id);
                                  }}
                                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => submitFeedback(property._id, property)}
                                  disabled={submittingFeedback[property._id] || !feedbackText[property._id]?.trim()}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                                >
                                  {submittingFeedback[property._id] ? (
                                    <>
                                      <span className="mr-2">⏳</span>
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <span className="mr-2">📤</span>
                                      Submit Feedback
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Stats Footer */}
      {properties.length > 0 && (
        <div className="bg-gray-50 py-8 mt-12">
          <div className="container mx-auto px-4">
            <h3 className="text-center text-2xl font-bold text-gray-800 mb-8">
              Property Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow text-center border border-gray-100">
                <div className="text-3xl font-bold text-blue-600">{properties.length}</div>
                <div className="text-gray-600 mt-2 font-medium">Total Properties</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow text-center border border-gray-100">
                <div className="text-3xl font-bold text-green-600">
                  {properties.filter(p => p.type === 'Rent').length}
                </div>
                <div className="text-gray-600 mt-2 font-medium">For Rent</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow text-center border border-gray-100">
                <div className="text-3xl font-bold text-purple-600">
                  {properties.filter(p => p.type === 'Lease').length}
                </div>
                <div className="text-gray-600 mt-2 font-medium">For Lease</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow text-center border border-gray-100">
                <div className="text-3xl font-bold text-yellow-600">
                  {properties.filter(p => p.bhk && (p.bhk.includes('2') || p.bhk.includes('3'))).length}
                </div>
                <div className="text-gray-600 mt-2 font-medium">2-3 BHK</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;