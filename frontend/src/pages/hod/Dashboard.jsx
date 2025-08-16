import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  LogOut, 
  FileText, 
  BarChart3, 
  Users, 
  Clock, 
  Building2, 
  CheckCircle, 
  Settings,
  AlertCircle,
  TrendingUp,
  Eye,
  Calendar,
  Award,
  Search
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getHODAppraisals, getHODDashboardStats, getDepartmentFaculty } from "../../utils/api";


const HODDashboard = () => {
  const [user, setUser] = useState(null);
  const [appraisals, setAppraisals] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [stats, setStats] = useState({
    totalAppraisals: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    totalFaculty: 0,
    submissionRate: 0
  });
  const [recentAppraisals, setRecentAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appraisalsData, statsData, facultyData] = await Promise.all([
        getHODAppraisals(),
        getHODDashboardStats().catch(() => ({ // Fallback if stats endpoint doesn't exist
          totalAppraisals: 0,
          pendingReview: 0,
          approved: 0,
          rejected: 0,
          totalFaculty: 0,
          submissionRate: 0
        })),
        getDepartmentFaculty().catch(() => []) // Fallback if faculty endpoint fails
      ]);
      
      setAppraisals(appraisalsData);
      setStats(statsData);
      setFaculty(facultyData);
      
      // Set recent appraisals (last 5)
      const recent = appraisalsData
        .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
        .slice(0, 5);
      setRecentAppraisals(recent);
      
      // Calculate stats from data if no backend stats
      if (statsData.totalAppraisals === 0 && appraisalsData.length > 0) {
        const calculatedStats = {
          totalAppraisals: appraisalsData.length,
          pendingReview: appraisalsData.filter(a => a.status === 'pending_hod').length,
          processed: appraisalsData.filter(a => a.status === 'pending_admin').length, // HOD processed, pending admin
          approved: appraisalsData.filter(a => a.status === 'approved').length, // Admin approved
          rejected: appraisalsData.filter(a => a.status === 'rejected').length,
          totalFaculty: facultyData.length, // Use actual faculty count
          submissionRate: 0
        };
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_hod':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'pending_admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'pending_hod':
        return 'Pending Review';
      case 'pending_admin':
        return 'Sent to Admin';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getProgressPercentage = () => {
    if (stats.totalAppraisals === 0) return 0;
    return Math.round(((stats.approved) / stats.totalAppraisals) * 100);
  };

  const filteredAppraisals = recentAppraisals.filter(appraisal => {
    const matchesSearch = appraisal.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appraisal.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appraisal.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appraisal.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'processed') {
      return matchesSearch && appraisal.status === 'pending_admin';
    }
    if (activeTab === 'approved') {
      return matchesSearch && appraisal.status === 'approved';
    }
    if (activeTab === 'rejected') {
      return matchesSearch && appraisal.status === 'rejected';
    }
    return matchesSearch && appraisal.status === activeTab;
  });

  if (!user) return <div>Loading...</div>;

  return (
    <DashboardLayout allowedRole="hod">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Enhanced Header - Responsive */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  HOD Dashboard
                </h1>
                <p className="text-slate-600 mt-2 text-sm sm:text-base lg:text-lg">Manage department appraisals and faculty oversight</p>
              </div>
            </div>
          </div>

          {location.state?.message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-6 sm:mb-8 shadow-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-emerald-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">{location.state.message}</span>
              </div>
            </div>
          )}
          
          {/* Enhanced Welcome Banner - Responsive */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl shadow-xl mb-6 sm:mb-8 overflow-hidden">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative flex flex-col sm:flex-row sm:items-center">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white border-opacity-30">
                      <span className="text-green-700 font-bold text-lg sm:text-xl lg:text-2xl">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4 lg:ml-6">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">Welcome back, {user.name}!</h2>
                    <p className="text-green-100 text-sm sm:text-base">Ready to review department activities today?</p>
                    <div className="flex items-center mt-1 sm:mt-2 text-green-100">
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">{user.department || 'Computer Science Department'}</span>
                    </div>
                  </div>
                </div>
                <div className="sm:ml-auto text-center sm:text-right">
                  <div className="text-white">
                    <div className="text-2xl sm:text-3xl font-bold">{stats.pendingReview}</div>
                    <div className="text-green-200 text-xs sm:text-sm">Pending Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-slate-800">{stats.totalAppraisals}</div>
                  <div className="text-slate-500 text-xs sm:text-sm">Total Submissions</div>
                </div>
              </div>
              <div className="flex items-center text-blue-600">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="text-xs sm:text-sm font-medium">This semester</span>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-slate-800">{stats.pendingReview}</div>
                  <div className="text-slate-500 text-xs sm:text-sm">Pending Review</div>
                </div>
              </div>
              <div className="flex items-center text-amber-600">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="text-xs sm:text-sm font-medium">Action required</span>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-slate-800">{stats.approved}</div>
                  <div className="text-slate-500 text-xs sm:text-sm">Approved</div>
                </div>
              </div>
              <div className="flex items-center text-emerald-600">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="text-xs sm:text-sm font-medium">Success rate: {getProgressPercentage()}%</span>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-slate-800">{faculty.length}</div>
                  <div className="text-slate-500 text-xs sm:text-sm">Faculty Members</div>
                </div>
              </div>
              <div className="flex items-center text-purple-600">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="text-xs sm:text-sm font-medium">Department wide</span>
              </div>
            </div>
          </div>

          {/* Action Cards and Recent Activity - Responsive Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 mb-8">
            {/* Quick Actions - Mobile First */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 h-full">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Quick Actions</h3>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <Link to="/hod/view-appraisals" className="block">
                    <div className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm sm:text-base">Review Appraisals</div>
                          <div className="text-green-100 text-xs sm:text-sm">{stats.pendingReview} pending reviews</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link to="/hod/manage-faculty" className="block">
                    <div className="group bg-white border-2 border-slate-200 hover:border-green-300 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 group-hover:bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 transition-colors">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm sm:text-base">Manage Faculty</div>
                          <div className="text-slate-500 text-xs sm:text-sm">View department members</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link to="/hod/reports" className="block">
                    <div className="group bg-white border-2 border-slate-200 hover:border-green-300 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 group-hover:bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 transition-colors">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm sm:text-base">Reports</div>
                          <div className="text-slate-500 text-xs sm:text-sm">View Department Reports</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link to="/hod/profile" className="block">
                    <div className="group bg-white border-2 border-slate-200 hover:border-green-300 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 group-hover:bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 transition-colors">
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm sm:text-base">Profile</div>
                          <div className="text-slate-500 text-xs sm:text-sm">View Profile</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity - Mobile First */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 h-full">
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Recent Submissions</h3>
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search faculty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-auto pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <Link to="/hod/view-appraisals">
                      <Button variant="outline" size="small" className="border-green-200 text-green-600 hover:bg-green-50 w-full sm:w-auto">
                        View All
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Filter Tabs - Responsive */}
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'all'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="hidden sm:inline">All</span>
                    <span className="sm:hidden">All</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pending_hod')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'pending_hod'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="hidden sm:inline">Pending ({stats.pendingReview})</span>
                    <span className="sm:hidden">Pending</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('processed')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'processed'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="hidden sm:inline">Processed ({stats.processed})</span>
                    <span className="sm:hidden">Processed</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('approved')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'approved'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="hidden sm:inline">Approved ({stats.approved})</span>
                    <span className="sm:hidden">Approved</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('rejected')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'rejected'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="hidden sm:inline">Rejected ({stats.rejected})</span>
                    <span className="sm:hidden">Rejected</span>
                  </button>
                </div>

                {/* Submissions List - Responsive */}
                <div className="space-y-3 sm:space-y-4">
                  {loading ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                      <div className="text-slate-500 mt-2 text-sm">Loading submissions...</div>
                    </div>
                  ) : filteredAppraisals.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                      </div>
                      <div className="text-slate-500 text-sm sm:text-base">
                        {searchTerm ? `No submissions found matching "${searchTerm}"` : 'No recent submissions found'}
                      </div>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-green-600 text-sm mt-2 hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredAppraisals.map((appraisal) => (
                      <div key={appraisal._id} className="group border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-green-200 transition-all duration-200">
                        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{appraisal.fullName}</h4>
                            <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-slate-600 mt-1">
                              <span className="truncate">{appraisal.designation}</span>
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                                {new Date(appraisal.submissionDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appraisal.status)}`}>
                              {formatStatus(appraisal.status)}
                            </span>
                            <Link to={`/hod/appraisal/${appraisal._id}`}>
                              <Button variant="outline" size="small" className="text-xs border-green-200 text-green-600 hover:bg-green-50">
                                <Eye className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Review</span>
                                <span className="sm:hidden">View</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
