import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, FileText, BarChart3, Users, Clock, Building2, CheckCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";

const HODDashboard = () => {
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
    if (userData.role !== 'hod') {
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
    <DashboardLayout allowedRole="hod">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">HOD Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage department appraisals and faculty</p>
            </div>
            <Button onClick={handleLogout} variant="secondary" className="px-4 sm:px-6 mt-4 sm:mt-0">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Logout</span>
            </Button>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 sm:px-6 py-4 mb-6 sm:mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-green-900">Welcome back, {user.name}!</h2>
                <p className="text-sm sm:text-base text-green-700">Ready to review department activities today?</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">HOD Actions</h2>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/hod/view-appraisals")}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-sm sm:text-base"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Review Department Appraisals
                </Button>
                <Button variant="secondary" className="w-full text-sm sm:text-base">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
                <Button variant="outline" className="w-full border-green-300 text-green-600 hover:bg-green-50 text-sm sm:text-base">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Faculty
                </Button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">Department Overview</h2>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base text-gray-700">Pending Reviews</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base text-gray-700">Total Faculty</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base text-gray-700">Approved Appraisals</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HODDashboard;
