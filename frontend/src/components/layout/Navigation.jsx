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
  LogOut,
  BarChart3,
  Award,
  Bell
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
          { name: 'Reports', path: '/hod/reports', icon: BarChart3 },
          { name: 'Profile', path: '/hod/profile', icon: UserCircle }
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: 'Appraisals', path: '/admin/view-appraisals', icon: FileText },
          { name: 'Users', path: '/admin/manage-users', icon: Users },
          { name: 'Departments', path: '/admin/departments', icon: Building2 },
          { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
          { name: 'Profile', path: '/admin/profile', icon: Settings }
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems(user?.role);

  const getRoleColors = (role) => {
    switch (role) {
      case 'faculty':
        return {
          primary: 'from-indigo-600 to-purple-600',
          bg: 'bg-indigo-500',
          text: 'text-indigo-600',
          hover: 'hover:text-indigo-600',
          bgHover: 'hover:bg-indigo-50',
          activeText: 'text-indigo-600',
          activeBg: 'bg-indigo-50',
          border: 'border-indigo-200'
        };
      case 'hod':
        return {
          primary: 'from-green-600 to-emerald-600',
          bg: 'bg-green-500',
          text: 'text-green-600',
          hover: 'hover:text-green-600',
          bgHover: 'hover:bg-green-50',
          activeText: 'text-green-600',
          activeBg: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'admin':
        return {
          primary: 'from-red-600 to-rose-600',
          bg: 'bg-red-500',
          text: 'text-red-600',
          hover: 'hover:text-red-600',
          bgHover: 'hover:bg-red-50',
          activeText: 'text-red-600',
          activeBg: 'bg-red-50',
          border: 'border-red-200'
        };
      default:
        return {
          primary: 'from-gray-600 to-gray-600',
          bg: 'bg-gray-500',
          text: 'text-gray-600',
          hover: 'hover:text-gray-600',
          bgHover: 'hover:bg-gray-50',
          activeText: 'text-gray-600',
          activeBg: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  const colors = getRoleColors(user?.role);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          
          {/* Enhanced Logo and Brand - Fixed for Admin */}
          <div className="flex items-center flex-shrink-0 min-w-0 max-w-[50%] sm:max-w-[60%] lg:max-w-none">
            <Link to={`/${user?.role}/dashboard`} className="flex-shrink-0 group">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${colors.primary} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                
                {/* Mobile Logo Text */}
                <div className="block sm:hidden">
                  <h1 className={`text-sm font-bold bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent leading-tight truncate`}>
                    Faculty Appraisal System
                  </h1>
                </div>
                
                {/* Tablet and Desktop Logo Text */}
                <div className="hidden sm:block min-w-0">
                  <h1 className={`text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent leading-tight truncate`}>
                    <span className="block md:hidden">Faculty App</span>
                    <span className="hidden md:block lg:hidden">Faculty Appraisal</span>
                    <span className="hidden lg:block">Faculty Appraisal System</span>
                  </h1>
                  <p className="text-xs text-gray-500 capitalize font-medium hidden xl:block truncate">{user?.role} Portal</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Optimized for Admin */}
          <div className="hidden xl:flex items-center space-x-1 flex-shrink-0">
            {navigationItems.map(item => {
              const IconComponent = item.icon;
              const active = location.pathname.startsWith(item.path) || 
                            (item.path === '/admin/manage-users' && location.pathname.startsWith('/admin/user'));
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-2 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-all duration-200 whitespace-nowrap
                    ${active
                      ? `${colors.activeText} ${colors.activeBg} shadow-sm`
                      : `text-gray-700 ${colors.hover} ${colors.bgHover}`
                    }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Large Desktop Navigation - Show all items with text */}
          <div className="hidden lg:flex xl:hidden items-center space-x-1 flex-shrink-0">
            {navigationItems.map(item => {
              const IconComponent = item.icon;
              const active = location.pathname.startsWith(item.path) || 
                            (item.path === '/admin/manage-users' && location.pathname.startsWith('/admin/user'));
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-2 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-all duration-200 whitespace-nowrap
                    ${active
                      ? `${colors.activeText} ${colors.activeBg} shadow-sm`
                      : `text-gray-700 ${colors.hover} ${colors.bgHover}`
                    }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Tablet Navigation - Show all items with text */}
          <div className="hidden md:flex lg:hidden items-center space-x-1 flex-shrink-0">
            {navigationItems.map(item => {
              const IconComponent = item.icon;
              const active = location.pathname.startsWith(item.path) || 
                            (item.path === '/admin/manage-users' && location.pathname.startsWith('/admin/user'));
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-1.5 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-all duration-200 whitespace-nowrap
                    ${active
                      ? `${colors.activeText} ${colors.activeBg} shadow-sm`
                      : `text-gray-700 ${colors.hover} ${colors.bgHover}`
                    }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs hidden lg:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Section & Controls - Fixed Width */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            
            {/* Desktop User Section - Hidden on mobile */}
            <div className="hidden xl:flex items-center space-x-2 border-l border-gray-200 pl-3">
              
              
              {/* User Info */}
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-lg ${colors.bg} flex items-center justify-center shadow-md`}>
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden 2xl:block min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate max-w-24">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize font-medium">
                    {user?.role}
                  </div>
                </div>
              </div>
              
              {/* Logout Button */}
              <Button 
                onClick={handleLogout} 
                variant="secondary" 
                size="small"
                className="flex items-center space-x-1 text-sm px-2 py-2 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden 2xl:inline">Logout</span>
              </Button>
            </div>

            {/* Mobile/Tablet User Section */}
            <div className="flex xl:hidden items-center space-x-1">
              
              
              {/* User Avatar */}
              <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg ${colors.bg} flex items-center justify-center shadow-md`}>
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1.5 sm:p-2 rounded-lg text-gray-700 ${colors.hover} ${colors.bgHover} focus:outline-none transition-all duration-200`}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile & Tablet Dropdown Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} xl:hidden transition-all duration-200 ease-in-out`}>
        <div className="px-3 sm:px-4 py-4 space-y-2 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200 shadow-xl backdrop-blur-sm">
          
          {/* Enhanced User Info Section */}
          <div className={`flex items-center px-4 py-4 mb-4 bg-gradient-to-r ${colors.primary} rounded-xl sm:rounded-2xl shadow-lg`}>
            <div className="flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-lg sm:text-xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold text-white truncate">
                {user?.name}
              </div>
              <div className="text-sm text-white/80 capitalize font-medium">
                {user?.role} Portal
              </div>
            </div>
          </div>

          {/* Enhanced Navigation Items */}
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const active = location.pathname.startsWith(item.path) || 
                            (item.path === '/admin/manage-users' && location.pathname.startsWith('/admin/user'));
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200
                    ${active
                      ? `${colors.activeText} ${colors.activeBg} shadow-sm`
                      : `text-gray-700 ${colors.hover} hover:bg-white hover:shadow-sm`
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Enhanced Logout Button */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Button 
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }} 
              variant="secondary" 
              className="w-full text-sm sm:text-base flex items-center justify-center space-x-3 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;