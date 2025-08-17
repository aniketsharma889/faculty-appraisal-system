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
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="animate-pulse">
              <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gray-300 rounded-full mb-4 sm:mb-0 sm:mr-6 mx-auto sm:mx-0"></div>
                <div className="text-center sm:text-left space-y-2">
                  <div className="h-8 bg-gray-300 rounded w-48 mx-auto sm:mx-0"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mx-auto sm:mx-0"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout allowedRole="admin">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {successMessage && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base text-red-700 font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="relative mb-4 sm:mb-0 sm:mr-6 mx-auto sm:mx-0">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white shadow-lg flex items-center justify-center ring-4 ring-red-200">
                  <span className="text-2xl sm:text-3xl font-bold text-red-600">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-red-400 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{profile?.name}</h1>
                <div className="flex items-center justify-center sm:justify-start mb-2">
                  <svg className="w-5 h-5 text-red-200 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-base sm:text-lg text-red-100 font-medium">System Administrator</p>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Super Admin
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Full Access
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
              {/* Personal Information */}
              <div className="xl:col-span-1">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-400 pl-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                      <p className="text-base lg:text-lg text-gray-800 font-medium">{profile?.name}</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                      <p className="text-sm lg:text-base text-gray-800 break-all">{profile?.email}</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                      <p className="text-base lg:text-lg text-gray-800 capitalize font-medium">{profile?.role}</p>
                    </div>
                    {profile?.employeeCode && (
                      <div className="border-l-4 border-red-400 pl-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Employee Code</label>
                        <p className="text-base lg:text-lg text-gray-800 font-mono">{profile.employeeCode}</p>
                      </div>
                    )}
                    <div className="border-l-4 border-red-400 pl-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Account Created</label>
                      <p className="text-base text-gray-800">{formatDate(profile?.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Information */}
              <div className="xl:col-span-2">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 mb-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">System Administration</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-l-4 border-orange-400 pl-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Access Level</label>
                      <p className="text-base text-gray-800 font-medium">Full Administrative Access</p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Last Login</label>
                      <p className="text-base text-gray-800">Active Session</p>
                    </div>
                  </div>
                </div>

                {/* Privileges Section */}
                <div className="bg-gradient-to-br from-red-50 via-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800">Administrator Privileges</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: "👥", text: "Manage all user accounts" },
                      { icon: "📊", text: "Review and approve appraisals" },
                      { icon: "🏢", text: "Department management" },
                      { icon: "⚙️", text: "System configuration access" },
                      { icon: "📈", text: "Analytics and reporting" },
                      { icon: "🔐", text: "Security management" }
                    ].map((privilege, index) => (
                      <div key={index} className="flex items-center p-3 bg-white rounded-lg border border-red-100 hover:shadow-md transition-all duration-200">
                        <span className="text-lg mr-3">{privilege.icon}</span>
                        <p className="text-sm text-red-700 font-medium">{privilege.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Administrator Account Status: Active</h3>
                  <p className="text-green-700 leading-relaxed">Your administrator account is active with full system privileges. You have unrestricted access to all system functions including user management, appraisal oversight, system configuration, and security controls.</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/admin/manage-users')}
                  className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-red-300 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Manage Users</span>
                </button>

                <button 
                  onClick={() => navigate('/admin/view-appraisals')}
                  className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-orange-300 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">View Appraisals</span>
                </button>

                <button 
                  onClick={() => navigate('/admin/reports')}
                  className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Reports</span>
                </button>

                
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="group px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate(`/admin/edit-profile/${profile?.id}`)}
                className="group px-6 py-3 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminProfile;
