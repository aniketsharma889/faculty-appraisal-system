import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FileText, 
  Eye, 
  Edit, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Filter,
  Search,
  Download,
  User,
  Building,
  Award,
  BookOpen,
  Briefcase,
  TrendingUp,
  BarChart3
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getMyAppraisals } from "../../utils/api";

const ViewAppraisals = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const data = await getMyAppraisals();
      setAppraisals(data);
    } catch (err) {
      setError(err.message || "Failed to fetch appraisals");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filtering with search
  const filteredAppraisals = appraisals.filter(appraisal => {
    const matchesStatus = filterStatus === "all" || appraisal.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      appraisal.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraisal.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraisal.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Statistics calculation
  const stats = {
    total: appraisals.length,
    pending_hod: appraisals.filter(a => a.status === 'pending_hod').length,
    pending_admin: appraisals.filter(a => a.status === 'pending_admin').length,
    approved: appraisals.filter(a => a.status === 'approved').length,
    rejected: appraisals.filter(a => a.status === 'rejected').length
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending_hod: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: AlertCircle,
        label: "Pending HOD Review",
        description: "Waiting for HOD approval"
      },
      pending_admin: {
        color: "bg-blue-100 text-blue-800 border-blue-300", 
        icon: Clock,
        label: "Pending Admin Review",
        description: "Waiting for admin approval"
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
        label: "Approved",
        description: "Successfully approved"
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: XCircle,
        label: "Rejected",
        description: "Needs revision"
      }
    };
    return configs[status] || configs.pending_hod;
  };

  if (loading) {
    return (
      <DashboardLayout allowedRole="faculty">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 border-b-2 border-indigo-600 mr-3"></div>
                <span className="text-gray-600 text-sm sm:text-base">Loading your appraisals...</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="faculty">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          
          {/* Header Section - Responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center justify-center lg:justify-start">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-indigo-600" />
                  My Appraisals
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Track and manage your faculty appraisal submissions
                </p>
              </div>
              
              <Button 
                onClick={() => navigate("/faculty/submit-appraisal")}
                className="bg-indigo-600 hover:bg-indigo-700 w-full lg:w-auto"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Submit New Appraisal</span>
                <span className="sm:hidden">Submit Appraisal</span>
              </Button>
            </div>
          </div>

          {/* Statistics Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Total Appraisals</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Pending HOD</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending_hod}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Pending Admin</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.pending_admin}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
              <div className="flex items-center">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          {/* Filters and Search - Responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Search - Full width on mobile */}
              <div className="relative flex-1 max-w-none lg:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 h-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search appraisals..."
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              {/* Status Filter - Stack on mobile */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[{
                    key: 'all', label: 'All', count: stats.total },
                    { key: 'pending_hod', label: 'Pending HOD', count: stats.pending_hod },
                    { key: 'pending_admin', label: 'Pending Admin', count: stats.pending_admin },
                    { key: 'approved', label: 'Approved', count: stats.approved },
                    { key: 'rejected', label: 'Rejected', count: stats.rejected }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setFilterStatus(filter.key)}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        filterStatus === filter.key
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="hidden sm:inline">{filter.label} ({filter.count})</span>
                      <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Appraisals List - Responsive */}
          {filteredAppraisals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {filterStatus === 'all' ? 'No appraisals found' : `No ${getStatusConfig(filterStatus).label.toLowerCase()} appraisals`}
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                {appraisals.length === 0 
                  ? "You haven't submitted any appraisals yet."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {appraisals.length === 0 && (
                <Button 
                  onClick={() => navigate("/faculty/submit-appraisal")}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Submit Your First Appraisal
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredAppraisals.map((appraisal) => {
                const statusConfig = getStatusConfig(appraisal.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={appraisal._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      
                      {/* Left Section - Main Info */}
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                              <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 flex-shrink-0" />
                              <span className="truncate">{appraisal.fullName}</span>
                            </h3>
                            <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center text-xs sm:text-sm text-gray-600 mt-1">
                              <div className="flex items-center">
                                <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{appraisal.department}</span>
                              </div>
                              <span className="hidden sm:inline mx-2">•</span>
                              <span className="truncate">{appraisal.employeeCode}</span>
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color} self-start sm:self-auto flex-shrink-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">{statusConfig.label}</span>
                            <span className="sm:hidden">{statusConfig.label.split(' ')[0]}</span>
                          </span>
                        </div>

                        {/* Submission Details - Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              Submitted: {new Date(appraisal.submissionDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              Publications: {appraisal.researchPublications?.length || 0}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              Awards: {appraisal.awardsRecognitions?.length || 0}
                            </span>
                          </div>
                        </div>

                        {/* Status Description */}
                        <p className="text-xs sm:text-sm text-gray-500">{statusConfig.description}</p>
                      </div>

                      {/* Right Section - Actions - Responsive */}
                      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3 lg:flex-col lg:space-x-0 lg:space-y-2 xl:flex-row xl:space-y-0 xl:space-x-3 lg:ml-6">
                        
                        <Button
                          onClick={() => navigate(`/faculty/appraisal/${appraisal._id}`)}
                          variant="secondary"
                          className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>

                        {(appraisal.status === 'pending_hod' || appraisal.status === 'rejected') && (
                          <Button
                            onClick={() => navigate(`/faculty/edit-appraisal/${appraisal._id}`)}
                            className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto text-xs sm:text-sm"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            <span className="hidden sm:inline">Edit</span>
                            <span className="sm:hidden">Edit</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Reviews Section (if any) - Responsive */}
                    {(appraisal.hodApproval?.remarks || appraisal.adminApproval?.remarks) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Review Comments:</h4>
                        <div className="space-y-2 sm:space-y-3">
                          {appraisal.hodApproval?.remarks && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-xs font-medium text-yellow-800 mb-1">HOD Review:</p>
                              <p className="text-xs sm:text-sm text-yellow-700">{appraisal.hodApproval.remarks}</p>
                            </div>
                          )}
                          {appraisal.adminApproval?.remarks && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs font-medium text-blue-800 mb-1">Admin Review:</p>
                              <p className="text-xs sm:text-sm text-blue-700">{appraisal.adminApproval.remarks}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewAppraisals;
