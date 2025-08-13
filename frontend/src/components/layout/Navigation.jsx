import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  Home, 
  FileText, 
  Eye, 
  UserCircle, 
  CheckSquare, 
  Users, 
  Building2, 
  Settings,
  LogOut
} from 'lucide-react';
import Button from '../ui/Button';

const Navigation = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
          { name: 'Manage Faculty', path: '/hod/manage-faculty', icon: Users },
          { name: 'Profile', path: '/hod/profile', icon: UserCircle }
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: 'Appraisals', path: '/admin/view-appraisals', icon: FileText },
          { name: 'Manage Users', path: '/admin/manage-users', icon: Users },
          { name: 'Departments', path: '/admin/departments', icon: Building2 },
          { name: 'Profile', path: '/admin/profile', icon: Settings }
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems(user?.role);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Brand */}
          <div className="flex items-center min-w-0 flex-1">
            <Link to={`/${user?.role}/dashboard`} className="flex-shrink-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-indigo-600 truncate">
                <span>Faculty Appraisal System</span>
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-4">
            {navigationItems.map(item => {
              const IconComponent = item.icon;
              const active = location.pathname.startsWith(item.path) || 
                            (item.path === '/admin/manage-users' && location.pathname.startsWith('/admin/user'));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-2 xl:px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 whitespace-nowrap
                    ${active
                      ? 'text-indigo-600 bg-indigo-50 shadow-sm'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              );
            })}
            
            {/* Desktop User Info and Logout */}
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 ml-4">
              <div className="hidden xl:flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 truncate max-w-24">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="secondary" 
                size="small"
                className="flex items-center space-x-1 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Tablet Navigation (md to lg) */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            {navigationItems.slice(0, 3).map(item => {
              const IconComponent = item.icon;
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`p-2 rounded-lg transition-all duration-200
                    ${active
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  title={item.name}
                >
                  <IconComponent className="w-5 h-5" />
                </Link>
              );
            })}
            
            {/* More menu for tablet */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:hidden transition-all duration-200 ease-in-out`}>
        <div className="px-3 py-3 space-y-1 bg-gray-50 border-t border-gray-200 shadow-lg">
          {/* User Info Section */}
          <div className="flex items-center px-3 py-3 mb-3 bg-white rounded-lg shadow-sm">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {user?.name}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = location.pathname.startsWith(item.path) || 
                          (item.path === '/admin/manage-users' && location.pathname.startsWith('/admin/user'));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${active
                    ? 'text-indigo-600 bg-indigo-50 shadow-sm'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-white hover:shadow-sm'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <div className="pt-3 mt-3 border-t border-gray-200">
            <Button 
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }} 
              variant="secondary" 
              className="w-full text-sm flex items-center justify-center space-x-2 py-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
