import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, FileText, Users, Settings, BarChart3, Shield, Activity } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!token || !storedUser) {
      navigate("/");
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      navigate("/");
      return;
    }
    
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <DashboardLayout allowedRole="admin">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your institution's appraisal system</p>
            </div>
            <Button onClick={handleLogout} variant="secondary" className="px-4 sm:px-6 mt-4 sm:mt-0">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Logout</span>
            </Button>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg px-4 sm:px-6 py-4 mb-6 sm:mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-red-900">Welcome back, {user.name}!</h2>
                <p className="text-sm sm:text-base text-red-700">Ready to manage the system today?</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">Admin Actions</h2>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Appraisals
                </Button>
                <Button variant="secondary" className="w-full text-sm sm:text-base">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50 text-sm sm:text-base">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">System Overview</h2>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base text-gray-700">Total Users</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base text-gray-700">Total Appraisals</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base text-gray-700">System Status</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-emerald-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
