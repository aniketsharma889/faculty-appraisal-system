import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Award,
  BookOpen,
  Users,
  Building2,
  AlertTriangle,
  GraduationCap,
  Activity
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getHODAppraisals, getDepartmentFaculty } from "../../utils/api";

const FacultyAppraisals = () => {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [appraisals, setAppraisals] = useState([]);
  const [filteredAppraisals, setFilteredAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [facultyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facultyData, appraisalsData] = await Promise.all([
        getDepartmentFaculty(),
        getHODAppraisals()
      ]);
      
      // Find the specific faculty member
      const targetFaculty = facultyData.find(f => f._id === facultyId);
      setFaculty(targetFaculty);
      
      // Filter appraisals for this faculty member
      const facultyAppraisals = appraisalsData.filter(appraisal => 
        appraisal.faculty?._id === facultyId || appraisal.facultyId === facultyId
      );
      
      setAppraisals(facultyAppraisals);
      setFilteredAppraisals(facultyAppraisals);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = appraisals;
    
    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(appraisal => appraisal.status === activeFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(appraisal =>
        appraisal.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appraisal.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appraisal.academicYear?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAppraisals(filtered);
  }, [appraisals, activeFilter, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_hod':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'pending_admin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_hod':
        return <Clock className="w-4 h-4" />;
      case 'pending_admin':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'pending_hod':
        return 'Pending Your Review';
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

  const getAppraisalStats = () => {
    return {
      total: appraisals.length,
      pending: appraisals.filter(a => a.status === 'pending_hod').length,
      processed: appraisals.filter(a => a.status === 'pending_admin').length,
      approved: appraisals.filter(a => a.status === 'approved').length,
      rejected: appraisals.filter(a => a.status === 'rejected').length
    };
  };

  const stats = getAppraisalStats();

  if (loading) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-3 text-gray-600">Loading faculty appraisals...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !faculty) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error || "Faculty member not found"}
              </h3>
              <p className="text-gray-500 mb-6">
                {error || "The requested faculty member could not be found."}
              </p>
              <Button
                onClick={() => navigate('/hod/manage-faculty')}
                className="bg-green-500 hover:bg-green-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Faculty Management
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="hod">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          
          {/* Header with Faculty Info - Responsive */}
          <div className="mb-6 sm:mb-8">
            <Button
              onClick={() => navigate('/hod/manage-faculty')}
              variant="outline"
              className="mb-4 sm:mb-6 border-green-200 text-green-600 hover:bg-green-50 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Faculty Management</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center mb-6 lg:mb-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl lg:text-3xl shadow-lg mb-4 sm:mb-0 sm:mr-4 lg:mr-6 mx-auto sm:mx-0">
                    {faculty.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      {faculty.name}
                    </h1>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center sm:justify-start text-gray-600 text-sm sm:text-base">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        <span>Faculty Member</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start text-gray-600 text-sm sm:text-base">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{faculty.email}</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start text-gray-600 text-sm sm:text-base">
                        <User className="w-4 h-4 mr-2" />
                        <span>Employee ID: {faculty.employeeCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats - Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 w-full lg:w-auto">
                  <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-xs sm:text-sm text-blue-500">Total</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-amber-600">{stats.pending}</div>
                    <div className="text-xs sm:text-sm text-amber-500">Pending</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.approved}</div>
                    <div className="text-xs sm:text-sm text-emerald-500">Approved</div>
                  </div>
                  <div className="bg-rose-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-rose-600">{stats.rejected}</div>
                    <div className="text-xs sm:text-sm text-rose-500">Rejected</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search - Responsive */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    activeFilter === 'all'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">All ({stats.total})</span>
                  <span className="sm:hidden">All</span>
                </button>
                <button
                  onClick={() => setActiveFilter('pending_hod')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    activeFilter === 'pending_hod'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">Pending Review ({stats.pending})</span>
                  <span className="sm:hidden">Pending</span>
                </button>
                <button
                  onClick={() => setActiveFilter('pending_admin')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    activeFilter === 'pending_admin'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">Processed ({stats.processed})</span>
                  <span className="sm:hidden">Processed</span>
                </button>
                <button
                  onClick={() => setActiveFilter('approved')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    activeFilter === 'approved'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">Approved ({stats.approved})</span>
                  <span className="sm:hidden">Approved</span>
                </button>
                <button
                  onClick={() => setActiveFilter('rejected')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    activeFilter === 'rejected'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">Rejected ({stats.rejected})</span>
                  <span className="sm:hidden">Rejected</span>
                </button>
              </div>
              
              <div className="text-xs sm:text-sm text-gray-600 text-center lg:text-right">
                Showing {filteredAppraisals.length} of {stats.total} appraisals
              </div>
            </div>
          </div>

          {/* Appraisals List - Responsive */}
          {filteredAppraisals.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12">
              <div className="text-center">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No appraisals found
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                  {activeFilter === 'all' 
                    ? `${faculty.name} hasn't submitted any appraisals yet.`
                    : `No ${activeFilter.replace('_', ' ')} appraisals found for ${faculty.name}.`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredAppraisals.map((appraisal, index) => (
                <div
                  key={appraisal._id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 sm:mb-6">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">
                          Apprarisal:  {index + 1}
                        </h3>
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(appraisal.status)} self-start sm:self-auto`}>
                          {getStatusIcon(appraisal.status)}
                          <span className="ml-1 sm:ml-2">{formatStatus(appraisal.status)}</span>
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          Submitted: {new Date(appraisal.submissionDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          {appraisal.department}
                        </span>
                        <span className="flex items-center">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          {appraisal.designation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Appraisal Summary - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center mb-2">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2" />
                        <span className="font-medium text-blue-700 text-sm sm:text-base">Publications</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {appraisal.researchPublications?.length || 0}
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center mb-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2" />
                        <span className="font-medium text-emerald-700 text-sm sm:text-base">Seminars</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                        {appraisal.seminars?.length || 0}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center mb-2">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mr-2" />
                        <span className="font-medium text-purple-700 text-sm sm:text-base">Projects</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">
                        {appraisal.projects?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* HOD Comments - Responsive */}
                  {appraisal.hodApproval?.remarks && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="w-4 h-4 text-amber-600 mr-2" />
                        <h5 className="font-semibold text-amber-800 text-sm sm:text-base">Your Review Comments</h5>
                      </div>
                      <p className="text-amber-700 text-sm sm:text-base">{appraisal.hodApproval.remarks}</p>
                    </div>
                  )}

                  {/* Admin Comments - Responsive */}
                  {appraisal.adminApproval?.remarks && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="w-4 h-4 text-blue-600 mr-2" />
                        <h5 className="font-semibold text-blue-800 text-sm sm:text-base">Admin Comments</h5>
                      </div>
                      <p className="text-blue-700 text-sm sm:text-base">{appraisal.adminApproval.remarks}</p>
                    </div>
                  )}

                  {/* Action Button - Responsive */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => navigate(`/hod/appraisal/${appraisal._id}`)}
                      className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto px-6 py-2 sm:py-3"
                      size="small"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="text-sm sm:text-base">View Details</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyAppraisals;
