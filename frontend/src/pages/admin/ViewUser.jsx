import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft,
  User,
  Mail,
  Building2,
  Calendar,
  Shield,
  GraduationCap,
  Crown,
  IdCard,
  Clock,
  Edit,
  CheckCircle
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getUserById } from "../../utils/api";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id);
      setUser(response.user);
    } catch (err) {
      setError(err.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-6 h-6 text-red-500" />;
      case 'hod':
        return <Crown className="w-6 h-6 text-purple-500" />;
      case 'faculty':
        return <GraduationCap className="w-6 h-6 text-blue-500" />;
      default:
        return <User className="w-6 h-6 text-gray-500" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'hod':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'faculty':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <DashboardLayout allowedRole="admin">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">Loading user details...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout allowedRole="admin">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
            <Button onClick={() => navigate('/admin/manage-users')} variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="admin">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-xl p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <Button 
                  onClick={() => navigate('/admin/manage-users')} 
                  variant="outline"
                  className="mb-4 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Users
                </Button>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center">
                  <User className="w-8 h-8 mr-3 text-red-200" />
                  User Details
                </h1>
                <p className="text-red-100 mt-2 text-sm sm:text-base">View detailed information about this user</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {location.state?.message && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                <span className="text-green-700">{location.state.message}</span>
              </div>
            </div>
          )}

          {user && (
            <div className="p-4 sm:p-6 lg:p-8">
              {/* User Profile Header */}
              <div className={`rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center
                ${
                  user.role === 'hod'
                    ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-100'
                    : user.role === 'faculty'
                    ? 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50'
                    : 'bg-gradient-to-r from-red-50 to-red-100'
                }
              `}>
                <div className="flex items-center mb-4 md:mb-0">
                  <div className={`rounded-full flex items-center justify-center font-bold shadow-lg border-4 border-white/40
                    ${
                      user.role === 'hod'
                        ? 'bg-gradient-to-br from-green-600 to-emerald-500 text-white'
                        : user.role === 'faculty'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-500 text-white'
                        : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                    }
                    w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-xl sm:text-2xl lg:text-3xl mr-4 sm:mr-6
                  `}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className={`font-bold mb-2
                      ${
                        user.role === 'hod'
                          ? 'text-green-800 text-lg sm:text-2xl lg:text-3xl'
                          : user.role === 'faculty'
                          ? 'text-blue-800 text-lg sm:text-2xl lg:text-3xl'
                          : 'text-gray-800 text-lg sm:text-2xl lg:text-3xl'
                      }
                    `}>
                      {user.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium border shadow-sm
                        ${
                          user.role === 'hod'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : user.role === 'faculty'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : getRoleColor(user.role)
                        }
                      `}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-red-500" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <p className="text-gray-800 font-medium">{user.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Email Address</label>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-gray-800 break-all">{user.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">User Role</label>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getRoleColor(user.role)} shadow-sm`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-red-500" />
                    Professional Information
                  </h3>
                  <div className="space-y-4">
                    {/* Only show department for non-admin users */}
                    {user.role !== 'admin' ? (
                      user.department ? (
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Department</label>
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <p className="text-gray-800">{user.department}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Department</label>
                          <p className="text-gray-500 italic">Not assigned</p>
                        </div>
                      )
                    ) : (
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Department</label>
                        <p className="text-blue-600 italic">System-wide access</p>
                      </div>
                    )}
                    
                    {/* Only show employee code for non-admin users */}
                    {user.role !== 'admin' ? (
                      user.employeeCode ? (
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Employee Code</label>
                          <div className="flex items-center">
                            <IdCard className="w-4 h-4 text-gray-400 mr-2" />
                            <p className="text-gray-800">{user.employeeCode}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Employee Code</label>
                          <p className="text-gray-500 italic">Not assigned</p>
                        </div>
                      )
                    ) : (
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Employee Code</label>
                        <p className="text-blue-600 italic">Administrative privileges</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Account Created</label>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-gray-800">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="mt-4 sm:mt-6 lg:col-span-2">
                  <div className={`rounded-xl p-4 sm:p-6 shadow-sm border flex items-center gap-4
                    ${
                      user.role === 'hod'
                        ? 'bg-gradient-to-r from-green-100 to-emerald-50 border-green-300'
                        : user.role === 'faculty'
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-50 border-blue-300'
                        : 'bg-gradient-to-r from-red-100 to-orange-50 border-red-200'
                    }
                  `}>
                    <div className="flex-shrink-0">
                      {user.role === 'hod' ? (
                        <Crown className="w-10 h-10 text-green-500" />
                      ) : user.role === 'faculty' ? (
                        <GraduationCap className="w-10 h-10 text-blue-500" />
                      ) : (
                        <Shield className="w-10 h-10 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 text-base sm:text-lg
                        ${
                          user.role === 'hod'
                            ? 'text-green-800'
                            : user.role === 'faculty'
                            ? 'text-blue-800'
                            : 'text-red-800'
                        }
                      `}>
                        Account Status: <span className="capitalize">{user.role}</span>
                      </h3>
                      <div className={`rounded px-3 py-1 inline-block font-medium text-xs sm:text-sm border
                        ${
                          user.role === 'hod'
                            ? 'bg-green-200 text-green-900 border-green-400'
                            : user.role === 'faculty'
                            ? 'bg-blue-200 text-blue-900 border-blue-400'
                            : 'bg-red-200 text-red-900 border-red-400'
                        }
                      `}>
                        Account Type: {user.role === 'admin'
                          ? 'Full System Access'
                          : user.role === 'hod'
                          ? 'Departmental Admin Privileges'
                          : 'Faculty Member'}
                      </div>
                      <p className={`mt-2 text-xs sm:text-sm
                        ${
                          user.role === 'hod'
                            ? 'text-green-700'
                            : user.role === 'faculty'
                            ? 'text-blue-700'
                            : 'text-red-700'
                        }
                      `}>
                        {user.role === 'admin'
                          ? 'Administrator account with unrestricted access to all system functions.'
                          : user.role === 'hod'
                          ? 'HOD account with department management and appraisal review privileges.'
                          : 'Faculty account for submitting and managing personal appraisals.'}
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              {/* Actions */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                <Button 
                  onClick={() => navigate('/admin/manage-users')} 
                  variant="secondary"
                  className="order-2 sm:order-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Users
                </Button>
                <Button 
                  onClick={() => navigate(`/admin/edit-user/${user.id || user._id}`)} 
                  className="bg-red-500 hover:bg-red-600 order-1 sm:order-2"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          )}
          </div>
        </div>
    </DashboardLayout>
  );
};

export default ViewUser;
