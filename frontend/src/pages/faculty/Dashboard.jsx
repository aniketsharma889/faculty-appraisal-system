import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  User, 
  CheckCircle, 
  Plus, 
  FileText, 
  Zap, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  FolderOpen, 
  Calendar, 
  Edit 
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getMyAppraisals } from "../../utils/api";

const FacultyDashboard = () => {
  const [user, setUser] = useState(null);
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending_hod: 0,
    pending_admin: 0,
    approved: 0,
    rejected: 0
  });
  const [activeTab, setActiveTab] = useState('all');
  const [filteredAppraisals, setFilteredAppraisals] = useState([]);
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
    if (userData.role !== 'faculty') {
      navigate("/");
      return;
    }
    
    setUser(userData);
    fetchAppraisals();
  }, [navigate]);

  const fetchAppraisals = async () => {
    try {
      const data = await getMyAppraisals();
      setAppraisals(data);
      calculateStats(data);
      setFilteredAppraisals(data);
    } catch (error) {
      console.error('Error fetching appraisals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appraisalData) => {
    const statistics = {
      total: appraisalData.length,
      pending_hod: appraisalData.filter(a => a.status === 'pending_hod').length,
      pending_admin: appraisalData.filter(a => a.status === 'pending_admin').length,
      approved: appraisalData.filter(a => a.status === 'approved').length,
      rejected: appraisalData.filter(a => a.status === 'rejected').length
    };
    setStats(statistics);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'all') {
      setFilteredAppraisals(appraisals);
    } else {
      setFilteredAppraisals(appraisals.filter(a => a.status === tab));
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
        return 'Pending HOD Review';
      case 'pending_admin':
        return 'Pending Admin Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const canEdit = (status) => {
    return status === 'pending_hod' || status === 'rejected';
  };

  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.approved / stats.total) * 100);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <DashboardLayout allowedRole="faculty">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Faculty Dashboard
                </h1>
                <p className="text-slate-600 mt-2 text-lg">Manage your academic achievements and appraisals</p>
              </div>
            </div>
          </div>
          
          {location.state?.message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl mb-8 shadow-sm">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-emerald-500" />
                {location.state.message}
              </div>
            </div>
          )}
          
          {/* Enhanced Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-xl mb-8 overflow-hidden">
            <div className="px-8 py-6 relative">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white border-opacity-30">
                    <span className="text-blue-700 font-bold text-2xl">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {user.name}!</h2>
                  <p className="text-indigo-100">Ready to showcase your academic excellence today?</p>
                </div>
                <div className="ml-auto hidden lg:block">
                  <div className="text-right text-white">
                    <div className="text-3xl font-bold">{stats.total}</div>
                    <div className="text-indigo-200 text-sm">Total Appraisals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Actions and Statistics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Quick Actions Card */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Quick Actions</h3>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Link to="/faculty/submit-appraisal" className="block">
                    <div className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl p-4 transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                          <Plus className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Submit New Appraisal</div>
                          <div className="text-indigo-100 text-sm">Create your academic report</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link to="/faculty/view-appraisals" className="block">
                    <div className="group bg-white border-2 border-slate-200 hover:border-indigo-300 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center mr-4 transition-colors">
                          <FileText className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">View All Appraisals</div>
                          <div className="text-slate-500 text-sm">Browse your submissions</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Enhanced Statistics */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Appraisal Overview</h3>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-800">{getProgressPercentage()}%</div>
                      <div className="text-slate-500 text-sm">Success Rate</div>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
                    </div>
                    <div className="text-blue-700 font-medium">Total</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-emerald-600">{stats.approved}</span>
                    </div>
                    <div className="text-emerald-700 font-medium">Approved</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-amber-600">{stats.pending_hod + stats.pending_admin}</span>
                    </div>
                    <div className="text-amber-700 font-medium">Pending</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-rose-600">{stats.rejected}</span>
                    </div>
                    <div className="text-rose-700 font-medium">Rejected</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Status Tabs and Appraisals List */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">My Appraisals</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'all'
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => handleTabChange('pending_hod')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'pending_hod'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Pending HOD ({stats.pending_hod})
                </button>
                <button
                  onClick={() => handleTabChange('pending_admin')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'pending_admin'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Pending Admin ({stats.pending_admin})
                </button>
                <button
                  onClick={() => handleTabChange('approved')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'approved'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Approved ({stats.approved})
                </button>
                <button
                  onClick={() => handleTabChange('rejected')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'rejected'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Rejected ({stats.rejected})
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <div className="text-slate-500 mt-4">Loading appraisals...</div>
                </div>
              ) : filteredAppraisals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="text-slate-500 mb-4 text-lg">
                    {activeTab === 'all' ? 'No appraisals found' : `No ${activeTab.replace('_', ' ')} appraisals found`}
                  </div>
                  {activeTab === 'all' && (
                    <Link to="/faculty/submit-appraisal">
                      <Button className="bg-indigo-500 hover:bg-indigo-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Your First Appraisal
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppraisals.map((appraisal) => (
                    <div key={appraisal._id} className="group border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-slate-800 mb-1">{appraisal.fullName}</h4>
                          <p className="text-slate-600 mb-2">{appraisal.department} • {appraisal.designation}</p>
                          <p className="text-sm text-slate-500">
                            Submitted on {new Date(appraisal.submissionDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long', 
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appraisal.status)}`}>
                            {formatStatus(appraisal.status)}
                          </span>
                          {canEdit(appraisal.status) && (
                            <Link to={`/faculty/edit-appraisal/${appraisal._id}`}>
                              <Button variant="outline" size="small" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <BookOpen className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="font-medium text-slate-700">Publications</span>
                          </div>
                          <div className="text-xl font-bold text-slate-800">{appraisal.researchPublications?.length || 0}</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <FolderOpen className="w-4 h-4 text-green-500 mr-2" />
                            <span className="font-medium text-slate-700">Projects</span>
                          </div>
                          <div className="text-xl font-bold text-slate-800">{appraisal.projects?.length || 0}</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 text-purple-500 mr-2" />
                            <span className="font-medium text-slate-700">Seminars</span>
                          </div>
                          <div className="text-xl font-bold text-slate-800">{appraisal.seminars?.length || 0}</div>
                        </div>
                      </div>

                      {appraisal.hodApproval?.remarks && (
                        <div className="mb-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <User className="w-4 h-4 text-amber-600 mr-2" />
                            <h5 className="font-semibold text-amber-800">HOD Remarks</h5>
                          </div>
                          <p className="text-amber-700">{appraisal.hodApproval.remarks}</p>
                        </div>
                      )}

                      {appraisal.adminApproval?.remarks && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <User className="w-4 h-4 text-blue-600 mr-2" />
                            <h5 className="font-semibold text-blue-800">Admin Remarks</h5>
                          </div>
                          <p className="text-blue-700">{appraisal.adminApproval.remarks}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};




export default FacultyDashboard;
                        