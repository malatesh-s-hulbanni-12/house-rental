import { useState, useEffect, useRef } from 'react';

const PropertyList = ({ properties, onDelete, onEdit }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard 
          key={property._id} 
          property={property} 
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

const PropertyCard = ({ property, onDelete, onEdit }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);

  // Auto slide images every 3 seconds - FIXED
  useEffect(() => {
    if (property.photos && property.photos.length > 1) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Start new interval
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === property.photos.length - 1 ? 0 : prev + 1
        );
      }, 3000); // 3 seconds
      
      // Cleanup on unmount
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [property.photos, currentImageIndex]);

  const nextImage = () => {
    if (!property.photos) return;
    
    // Reset interval when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentImageIndex((prev) => 
      prev === property.photos.length - 1 ? 0 : prev + 1
    );
    
    // Restart auto-slide after manual navigation
    setTimeout(() => {
      if (property.photos && property.photos.length > 1) {
        intervalRef.current = setInterval(() => {
          setCurrentImageIndex((prev) => 
            prev === property.photos.length - 1 ? 0 : prev + 1
          );
        }, 3000);
      }
    }, 100);
  };

  const prevImage = () => {
    if (!property.photos) return;
    
    // Reset interval when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.photos.length - 1 : prev - 1
    );
    
    // Restart auto-slide after manual navigation
    setTimeout(() => {
      if (property.photos && property.photos.length > 1) {
        intervalRef.current = setInterval(() => {
          setCurrentImageIndex((prev) => 
            prev === property.photos.length - 1 ? 0 : prev + 1
          );
        }, 3000);
      }
    }, 100);
  };

  // Handle dot click
  const goToImage = (index) => {
    if (!property.photos) return;
    
    // Reset interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentImageIndex(index);
    
    // Restart auto-slide
    setTimeout(() => {
      if (property.photos && property.photos.length > 1) {
        intervalRef.current = setInterval(() => {
          setCurrentImageIndex((prev) => 
            prev === property.photos.length - 1 ? 0 : prev + 1
          );
        }, 3000);
      }
    }, 100);
  };

  return (
    <div className="property-card group hover:shadow-xl transition-shadow duration-300 bg-white rounded-xl overflow-hidden">
      {/* Image Carousel - FIXED AUTO-SLIDE */}
      <div className="relative h-56 overflow-hidden">
        {property.photos && property.photos.length > 0 ? (
          <>
            {/* Main Image */}
            <img
              src={property.photos[currentImageIndex]}
              alt={`${property.ownerName} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-500"
              key={currentImageIndex} // Key helps React detect image change
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            
            {/* Type Badge */}
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                property.type === 'Rent' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-purple-500 text-white'
              }`}>
                {property.type}
              </span>
            </div>
            
            {/* Image Navigation Dots */}
            {property.photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {property.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white w-6 scale-125' 
                        : 'bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* Image Counter */}
            <div className="absolute bottom-3 right-3">
              <span className="bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                <span className="mr-1 text-xs">📸</span>
                {currentImageIndex + 1}/{property.photos.length}
              </span>
            </div>
            
            {/* Previous/Next Buttons */}
            {property.photos.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-4xl text-gray-300">🏠</span>
          </div>
        )}
      </div>
      
      {/* Property Details - BETTER SIZE */}
      <div className="p-4">
        {/* Owner Name */}
        <h3 className="text-lg font-bold text-gray-800 mb-3 truncate">
          {property.ownerName}
        </h3>
        
        {/* BHK and Square Feet - PROPER SIZE */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* BHK */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-2">
                <span className="text-blue-600 text-sm">🏘️</span>
              </div>
              <div>
                <div className="text-xs text-blue-700 font-medium">BHK</div>
                <div className="text-base font-bold text-blue-900">
                  {property.bhk || 'N/A'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Square Feet */}
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center mr-2">
                <span className="text-purple-600 text-sm">📏</span>
              </div>
              <div>
                <div className="text-xs text-purple-700 font-medium">AREA</div>
                <div className="text-base font-bold text-purple-900">
                  {property.squareFeet ? `${property.squareFeet} sq.ft` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pricing - PROPER SIZE */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">Monthly Rent</div>
            <div className="text-lg font-bold text-blue-700">
              ₹{property.rent?.toLocaleString()}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">Advance</div>
            <div className="text-lg font-bold text-green-700">
              ₹{property.advance?.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Contact and Date */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">📞</span>
            <span className="text-sm text-gray-700 truncate">{property.phoneNumber}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">📅</span>
            <span className="text-sm text-gray-700">
              {new Date(property.updatedAt || property.createdAt).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>
        
        {/* Action Buttons - PROPER SIZE */}
        // In PropertyList component, modify the action buttons section:
{/* Action Buttons - Only show if onDelete and onEdit are provided */}
{(onDelete || onEdit) && (
  <div className="flex space-x-3">
    {onDelete && (
      <button
        onClick={() => onDelete(property._id)}
        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow hover:shadow-md active:scale-95 text-sm"
      >
        Delete
      </button>
    )}
    {onEdit && (
      <button 
        onClick={() => onEdit(property)}
        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow hover:shadow-md active:scale-95 text-sm"
      >
        Edit
      </button>
    )}
  </div>
)}



      </div>
    </div>
  );
};

export default PropertyList;