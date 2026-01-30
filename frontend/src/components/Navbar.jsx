import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = ({ isLoggedIn, adminEmail, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass shadow-lg py-2' : 'bg-white py-3'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo - Left */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🏠</span>
            </div>
            <Link to="/" className="text-2xl font-bold gradient-text">
              HouseRental
            </Link>
          </div>

          {/* Right Side Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="nav-link font-medium">
              Home
            </Link>

            {!isLoggedIn ? (
              <Link 
                to="/login" 
                className="btn-primary text-sm px-6 py-2.5"
              >
                Admin Login
              </Link>
            ) : (
              <div className="relative">
                {/* Profile with modern design */}
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 focus:outline-none group"
                >
                  <div className="relative">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <span className="text-white font-bold text-lg">
                        {adminEmail?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="font-semibold text-gray-800 text-sm">
                      {adminEmail?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">
                      {adminEmail}
                    </p>
                  </div>
                </button>

                {/* Modern Dropdown */}
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 z-50 border border-gray-100 slide-up">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">Admin Panel</p>
                        <p className="text-sm text-gray-500 truncate">{adminEmail}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link 
  to="/admin" 
  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors group"
  onClick={() => setShowDropdown(false)}
>
  <span className=
  
  "mr-3 text-blue-500">📊</span>
  <span>Dashboard</span>
</Link>
                        
                        <Link 
                          to="/my-creations" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors group"
                          onClick={() => setShowDropdown(false)}
                        >
                          <span className="mr-3 text-green-500">📋</span>
                          <span>My Creations</span>
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={() => {
                            onLogout();
                            setShowDropdown(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors group"
                        >
                          <span className="mr-3">🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;