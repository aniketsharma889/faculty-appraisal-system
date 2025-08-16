import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getUserProfile } from "../../utils/api";

const FacultyProfile = () => {
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
      <DashboardLayout allowedRole="faculty">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            {/* Loading skeleton - same as HOD profile */}
            <div className="animate-pulse">
              <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-full mb-4 sm:mb-0 sm:mr-6 mx-auto sm:mx-0"></div>
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
      <DashboardLayout allowedRole="faculty">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
    <DashboardLayout allowedRole="faculty">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {successMessage && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-indigo-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base text-indigo-700 font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="relative mb-4 sm:mb-0 sm:mr-6 mx-auto sm:mx-0">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-indigo-400 rounded-full border-2 border-white flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{profile?.name}</h1>
                <div className="flex items-center justify-center sm:justify-start">
                  <svg className="w-5 h-5 text-indigo-200 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-base sm:text-lg text-indigo-100 font-medium capitalize">{profile?.role}</p>
                </div>
                {profile?.department && (
                  <p className="text-indigo-200 mt-1">{profile.department}</p>
                )}
              </div>
            </div>
          </div>

          {/* Content Section - using similar structure as HOD but with indigo theme */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">Personal Information</h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-indigo-400 pl-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <p className="text-base lg:text-lg text-gray-800 font-medium">{profile?.name}</p>
                  </div>
                  <div className="border-l-4 border-indigo-400 pl-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                    <p className="text-base lg:text-lg text-gray-800 break-all">{profile?.email}</p>
                  </div>
                  <div className="border-l-4 border-indigo-400 pl-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                    <p className="text-base lg:text-lg text-gray-800 capitalize font-medium">{profile?.role}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                    </svg>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">Professional Information</h2>
                </div>
                <div className="space-y-4">
                  {profile?.employeeCode && (
                    <div className="border-l-4 border-purple-400 pl-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Employee Code</label>
                      <p className="text-base lg:text-lg text-gray-800 font-mono">{profile.employeeCode}</p>
                    </div>
                  )}
                  {profile?.department && (
                    <div className="border-l-4 border-purple-400 pl-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                      <p className="text-base lg:text-lg text-gray-800 font-medium">{profile.department}</p>
                    </div>
                  )}
                  <div className="border-l-4 border-purple-400 pl-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Account Created</label>
                    <p className="text-base lg:text-lg text-gray-800">{formatDate(profile?.createdAt)}</p>
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
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Account Status: Active</h3>
                  <p className="text-green-700 leading-relaxed">Your faculty account is active and in good standing. You can access all faculty features including appraisal submissions and profile management.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/faculty/dashboard')}
                className="group px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate(`/faculty/edit-profile/${profile?.id}`)}
                className="group px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
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

export default FacultyProfile;
