import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  Home, 
  FileText, 
  Eye, 
  UserCircle, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Building2, 
  Settings,
  LogOut
} from 'lucide-react';
import Button from '../ui/Button';

const Navigation = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getNavigationItems = (role) => {
    const baseItems = [
      { name: 'Dashboard', path: `/${role}/dashboard`, icon: Home }
    ];

    switch (role) {
      case 'faculty':
        return [
          ...baseItems,
          { name: 'Submit Appraisal', path: '/faculty/submit-appraisal', icon: FileText },
          { name: 'My Appraisals', path: '/faculty/view-appraisals', icon: Eye },
          { name: 'Profile', path: '/faculty/profile', icon: UserCircle }
        ];
      case 'hod':
        return [
          ...baseItems,
          { name: 'View Appraisals', path: '/hod/view-appraisals', icon: CheckSquare },
          { name: 'Reports', path: '/hod/reports', icon: BarChart3 },
          { name: 'Profile', path: '/hod/profile', icon: UserCircle }
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: 'Manage Users', path: '/admin/manage-users', icon: Users },
          { name: 'Departments', path: '/admin/departments', icon: Building2 },
          { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
          { name: 'Profile', path: '/admin/profile', icon: Settings }
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems(user?.role);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to={`/${user?.role}/dashboard`} className="flex-shrink-0">
              <h1 className="text-lg md:text-base lg:text-xl font-bold text-indigo-600">
                Faculty Appraisal System
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-8">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gray-700 hover:text-indigo-600 px-2 md:px-2 lg:px-3 py-2 rounded-md text-xs md:text-xs lg:text-sm font-medium transition-colors duration-200 flex items-center space-x-1 lg:space-x-2"
                >
                  <IconComponent className="w-3 h-3 md:w-3 md:h-3 lg:w-4 lg:h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* User Info and Logout */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              
              <Button onClick={handleLogout} variant="secondary" className="text-xs md:text-xs lg:text-sm px-2 md:px-2 lg:px-3 py-1 md:py-1 lg:py-2 flex items-center space-x-1">
                <LogOut className="w-3 h-3 md:w-3 md:h-3 lg:w-4 lg:h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-700 hover:text-indigo-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors duration-200 flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          {/* Mobile User Info and Logout */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm sm:text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <Button 
                onClick={handleLogout} 
                variant="secondary" 
                className="w-full text-left text-sm sm:text-base flex items-center space-x-2 justify-center"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
