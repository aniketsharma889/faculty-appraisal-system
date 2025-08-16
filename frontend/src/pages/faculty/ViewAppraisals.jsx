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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your appraisals...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="faculty">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-8 h-8 mr-3 text-indigo-600" />
                  My Appraisals
                </h1>
                <p className="text-gray-600 mt-2">
                  Track and manage your faculty appraisal submissions
                </p>
              </div>
              
              <Button 
                onClick={() => navigate("/faculty/submit-appraisal")}
                className="bg-indigo-600 hover:bg-indigo-700 w-full lg:w-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Submit New Appraisal
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Appraisals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending HOD</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending_hod}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Admin</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.pending_admin}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search appraisals..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <div className="flex space-x-2">
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterStatus === filter.key
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Appraisals List */}
          {filteredAppraisals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filterStatus === 'all' ? 'No appraisals found' : `No ${getStatusConfig(filterStatus).label.toLowerCase()} appraisals`}
              </h3>
              <p className="text-gray-500 mb-6">
                {appraisals.length === 0 
                  ? "You haven't submitted any appraisals yet."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {appraisals.length === 0 && (
                <Button 
                  onClick={() => navigate("/faculty/submit-appraisal")}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Submit Your First Appraisal
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAppraisals.map((appraisal) => {
                const statusConfig = getStatusConfig(appraisal.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={appraisal._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      
                      {/* Left Section - Main Info */}
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                              <User className="w-5 h-5 mr-2 text-gray-500" />
                              {appraisal.fullName}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Building className="w-4 h-4 mr-1" />
                              {appraisal.department} • {appraisal.employeeCode}
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Submission Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>
                              Submitted: {new Date(appraisal.submissionDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <BookOpen className="w-4 h-4 mr-2" />
                            <span>
                              Publications: {appraisal.researchPublications?.length || 0}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Award className="w-4 h-4 mr-2" />
                            <span>
                              Awards: {appraisal.awardsRecognitions?.length || 0}
                            </span>
                          </div>
                        </div>

                        {/* Status Description */}
                        <p className="text-sm text-gray-500">{statusConfig.description}</p>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-2 xl:space-y-0 xl:space-x-3 lg:ml-6">
                        
                        <Button
                          onClick={() => navigate(`/faculty/appraisal/${appraisal._id}`)}
                          variant="secondary"
                          className="w-full sm:w-auto"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>

                        {(appraisal.status === 'pending_hod' || appraisal.status === 'rejected') && (
                          <Button
                            onClick={() => navigate(`/faculty/edit-appraisal/${appraisal._id}`)}
                            className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Reviews Section (if any) */}
                    {(appraisal.hodApproval?.remarks || appraisal.adminApproval?.remarks) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Review Comments:</h4>
                        <div className="space-y-2">
                          {appraisal.hodApproval?.remarks && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-xs font-medium text-yellow-800 mb-1">HOD Review:</p>
                              <p className="text-sm text-yellow-700">{appraisal.hodApproval.remarks}</p>
                            </div>
                          )}
                          {appraisal.adminApproval?.remarks && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs font-medium text-blue-800 mb-1">Admin Review:</p>
                              <p className="text-sm text-blue-700">{appraisal.adminApproval.remarks}</p>
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
