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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
            <div className="mb-4 sm:mb-0">
              <Button 
                onClick={() => navigate('/admin/manage-users')} 
                variant="outline"
                className="mb-4 border-red-200 text-red-600 hover:bg-red-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
              </Button>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center">
                <User className="w-8 h-8 mr-3 text-red-500" />
                User Details
              </h1>
              <p className="text-gray-600 mt-2">View detailed information about this user</p>
            </div>
          </div>

          {/* Success Message */}
          {location.state?.message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                {location.state.message}
              </div>
            </div>
          )}

          {user && (
            <>
              {/* User Profile Header */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 lg:p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl lg:text-3xl font-bold mr-6">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                        {user.name}
                      </h2>
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-red-500" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <p className="text-gray-800 font-medium">{user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-gray-800">{user.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">User Role</label>
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-red-500" />
                    Professional Information
                  </h3>
                  <div className="space-y-4">
                    {/* Only show department for non-admin users */}
                    {user.role !== 'admin' ? (
                      user.department ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <p className="text-gray-800">{user.department}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                          <p className="text-gray-500 italic">Not assigned</p>
                        </div>
                      )
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                        <p className="text-blue-600 italic">System-wide access</p>
                      </div>
                    )}
                    
                    {/* Only show employee code for non-admin users */}
                    {user.role !== 'admin' ? (
                      user.employeeCode ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Employee Code</label>
                          <div className="flex items-center">
                            <IdCard className="w-4 h-4 text-gray-400 mr-2" />
                            <p className="text-gray-800">{user.employeeCode}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Employee Code</label>
                          <p className="text-gray-500 italic">Not assigned</p>
                        </div>
                      )
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Employee Code</label>
                        <p className="text-blue-600 italic">Administrative privileges</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Account Created</label>
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
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-red-500" />
                    Account Status
                  </h3>
                 
                  <div className={`rounded-lg p-4 border ${
                    user.role === 'admin' 
                      ? 'bg-red-50 border-red-200' 
                      : user.role === 'hod' 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className={`text-sm font-medium mb-1 ${
                      user.role === 'admin' 
                        ? 'text-red-600' 
                        : user.role === 'hod' 
                        ? 'text-purple-600' 
                        : 'text-blue-600'
                    }`}>
                      Account Type
                    </div>
                    <div className={`font-semibold capitalize ${
                      user.role === 'admin' 
                        ? 'text-red-800' 
                        : user.role === 'hod' 
                        ? 'text-purple-800' 
                        : 'text-blue-800'
                    }`}>
                      {user.role}
                      {user.role === 'admin' && <span className="text-sm font-normal"> - Full System Access</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <Button 
                    onClick={() => navigate('/admin/manage-users')} 
                    variant="secondary"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Users
                  </Button>
                  <Button 
                    onClick={() => navigate(`/admin/edit-user/${user.id || user._id}`)} 
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewUser;
