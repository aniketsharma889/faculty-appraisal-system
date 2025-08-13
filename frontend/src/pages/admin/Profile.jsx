import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getUserProfile } from "../../utils/api";

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get success message from navigation state
  const successMessage = location.state?.message;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setProfile(response.user);
      } catch (error) {
        setError(error.message || "Failed to fetch profile");
        // If unauthorized, redirect to login
        if (error.message?.includes('token') || error.message?.includes('authorization')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout allowedRole="admin">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center items-center h-32">
              <div className="text-lg">Loading profile...</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout allowedRole="admin">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout allowedRole="admin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6">
              <span className="text-sm sm:text-base">{successMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-600 flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 mx-auto sm:mx-0">
              <span className="text-lg sm:text-2xl font-bold text-white">
                {profile?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">{profile?.name}</h1>
              <p className="text-base sm:text-lg text-red-600 capitalize font-medium">System Administrator</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-800">{profile?.name}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600">Email Address</label>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-800 break-all">{profile?.email}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600">Role</label>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-800 capitalize">{profile?.role}</p>
                </div>
              </div>
            </div>

            {/* Administrative Information */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">Administrative Information</h2>
              <div className="space-y-3 sm:space-y-4">
                {profile?.employeeCode && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600">Employee Code</label>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-800">{profile.employeeCode}</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600">System Access Level</label>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-800">Full Administrative Access</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600">Account Created</label>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-800">{formatDate(profile?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privileges Section */}
          <div className="mt-6 sm:mt-8 bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Administrator Privileges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm text-red-700">Manage all user accounts</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm text-red-700">Review and approve appraisals</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm text-red-700">Department management</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm text-red-700">System configuration access</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="mt-6 sm:mt-8 bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xs sm:text-sm font-medium text-green-800">Account Status: Active</h3>
                <p className="text-xs sm:text-sm text-green-700">Your administrator account is active with full system privileges.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm sm:text-base"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate(`/admin/edit-profile/${profile?.id}`)}
              className="px-4 sm:px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm sm:text-base"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminProfile;
