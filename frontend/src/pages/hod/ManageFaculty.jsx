import { useState, useEffect } from "react";
import { 
  Users, 
  Mail, 
  Building2, 
  Calendar, 
  Search, 
  Filter,
  UserCheck,
  UserX,
  Eye,
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Award,
  CheckCircle,
  AlertTriangle,
  User,
  GraduationCap,
  BookOpen,
  Target,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getDepartmentFaculty, getHODAppraisals } from "../../utils/api";

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");

  const navigate = useNavigate();

  useEffect(() => { 
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facultyData, appraisalsData] = await Promise.all([
        getDepartmentFaculty(),
        getHODAppraisals()
      ]);
      setFaculty(facultyData);
      setAppraisals(appraisalsData);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const getFacultyAppraisals = (facultyId) => {
    return appraisals.filter(appraisal => appraisal.faculty?._id === facultyId);
  };

  const getFacultyStats = (facultyId) => {
    const facultyAppraisals = getFacultyAppraisals(facultyId);
    return {
      total: facultyAppraisals.length,
      pending: facultyAppraisals.filter(a => a.status === 'pending_hod' || a.status === 'pending_admin').length,
      approved: facultyAppraisals.filter(a => a.status === 'approved').length,
      rejected: facultyAppraisals.filter(a => a.status === 'rejected').length,
    };
  };

  const getOverallStats = () => {
    const totalFaculty = faculty.length;
    const activeFaculty = faculty.filter(member => {
      const stats = getFacultyStats(member._id);
      return stats.total > 0;
    }).length;
    const pendingReviews = faculty.reduce((total, member) => {
      const stats = getFacultyStats(member._id);
      return total + stats.pending;
    }, 0);
    const completedFaculty = faculty.filter(member => {
      const stats = getFacultyStats(member._id);
      return stats.approved > 0 || stats.rejected > 0;
    }).length;

    return {
      totalFaculty,
      activeFaculty,
      pendingReviews,
      completedFaculty,
      activityRate: totalFaculty > 0 ? Math.round((activeFaculty / totalFaculty) * 100) : 0
    };
  };

  const getStatusColor = (hasAppraisals, stats) => {
    if (!hasAppraisals) return "bg-gray-100 text-gray-800 border-gray-300";
    if (stats.pending > 0) return "bg-amber-100 text-amber-800 border-amber-300";
    if (stats.approved > 0 || stats.rejected > 0) return "bg-green-100 text-green-800 border-green-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusText = (hasAppraisals, stats) => {
    if (!hasAppraisals) return "No Submissions";
    if (stats.pending > 0) return `${stats.pending} Pending Review`;
    if (stats.approved > 0 || stats.rejected > 0) return "Review Complete";
    return "No Submissions";
  };

  const getStatusIcon = (hasAppraisals, stats) => {
    if (!hasAppraisals) return <Clock className="w-4 h-4" />;
    if (stats.pending > 0) return <AlertTriangle className="w-4 h-4" />;
    if (stats.approved > 0 || stats.rejected > 0) return <CheckCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const filteredAndSortedFaculty = faculty
    .filter(member => {
      const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === "all") return matchesSearch;
      
      const stats = getFacultyStats(member._id);
      const hasAppraisals = stats.total > 0;
      
      if (filterBy === "active") return matchesSearch && hasAppraisals;
      if (filterBy === "inactive") return matchesSearch && !hasAppraisals;
      if (filterBy === "pending") return matchesSearch && stats.pending > 0;
      if (filterBy === "completed") return matchesSearch && (stats.approved > 0 || stats.rejected > 0);
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name?.localeCompare(b.name) || 0;
      if (sortBy === "email") return a.email?.localeCompare(b.email) || 0;
      if (sortBy === "employeeCode") return a.employeeCode?.localeCompare(b.employeeCode) || 0;
      if (sortBy === "activity") {
        const statsA = getFacultyStats(a._id);
        const statsB = getFacultyStats(b._id);
        return statsB.total - statsA.total;
      }
      if (sortBy === "joinDate") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  const overallStats = getOverallStats();

  if (loading) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-3 text-gray-600">Loading faculty members...</span>
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
          
          {/* Enhanced Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
              <div className="mb-4 sm:mb-6 lg:mb-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  Faculty Management
                </h1>
                <p className="text-slate-600 text-sm sm:text-base lg:text-lg">Monitor and manage your department's faculty members</p>
              </div>
              
              {/* Quick Stats Cards - Responsive Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-2 w-full lg:w-auto">
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Total Faculty</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{overallStats.totalFaculty}</p>
                    </div>
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Activity Rate</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{overallStats.activityRate}%</p>
                    </div>
                    <Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-lg">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Statistics Dashboard - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-slate-800">{overallStats.totalFaculty}</div>
                  <div className="text-slate-500 text-xs sm:text-sm">Total Faculty</div>
                </div>
              </div>
              <div className="flex items-center text-blue-600">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="text-xs sm:text-sm font-medium">Department wide</span>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-slate-800">{overallStats.activeFaculty}</div>
                  <div className="text-slate-500 text-xs sm:text-sm">Active Faculty</div>
                </div>
              </div>
              <div className="flex items-center text-emerald-600">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="text-xs sm:text-sm font-medium">{overallStats.activityRate}% activity rate</span>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-slate-800">{overallStats.pendingReviews}</div>
                  <div className="text-slate-500 text-xs sm:text-sm">Pending Reviews</div>
                </div>
              </div>
              <div className="flex items-center text-amber-600">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="text-xs sm:text-sm font-medium">Action required</span>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-slate-800">{overallStats.completedFaculty}</div>
                  <div className="text-slate-500 text-xs sm:text-sm">Completed</div>
                </div>
              </div>
              <div className="flex items-center text-purple-600">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="text-xs sm:text-sm font-medium">Reviews done</span>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filter Controls - Responsive Layout */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="space-y-4 lg:space-y-0 lg:flex lg:justify-between lg:items-center">
              <div className="space-y-3 sm:space-y-4 lg:space-y-0 lg:flex lg:space-x-4 lg:flex-1">
                {/* Search Input - Full width on mobile */}
                <div className="relative w-full lg:max-w-md">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search faculty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full text-sm"
                  />
                </div>
                
                {/* Filter Controls - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                    <option value="employeeCode">Sort by Employee Code</option>
                    <option value="activity">Sort by Activity</option>
                    <option value="joinDate">Sort by Join Date</option>
                  </select>
                  
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                  >
                    <option value="all">All Faculty</option>
                    <option value="active">Active (With Submissions)</option>
                    <option value="inactive">Inactive (No Submissions)</option>
                    <option value="pending">Pending Review</option>
                    <option value="completed">Review Complete</option>
                  </select>
                </div>
              </div>

              {/* Action Section - Stack on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 lg:space-y-0">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {filteredAndSortedFaculty.length} of {faculty.length} faculty
                </div>
                <Button
                  onClick={() => navigate("/hod/view-appraisals")}
                  className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
                  size="small"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">View All Appraisals</span>
                  <span className="sm:hidden">View Appraisals</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Faculty Grid - Responsive */}
          {filteredAndSortedFaculty.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || filterBy !== 'all' ? "No faculty members found" : "No faculty members in your department"}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                  {searchTerm || filterBy !== 'all'
                    ? `No faculty members match your current search and filter criteria`
                    : "Faculty members will appear here once they are added to your department"
                  }
                </p>
                {(searchTerm || filterBy !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterBy('all');
                    }}
                    variant="outline"
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredAndSortedFaculty.map((member) => {
                const stats = getFacultyStats(member._id);
                const hasAppraisals = stats.total > 0;
                
                return (
                  <div
                    key={member._id}
                    className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:border-green-200 transition-all duration-300 group"
                  >
                    {/* Enhanced Faculty Header - Responsive */}
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="flex items-center min-w-0 flex-1 mr-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          {hasAppraisals && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                            {member.name}
                          </h3>
                          <div className="flex items-center mt-1">
                            <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600">Faculty Member</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(hasAppraisals, stats)} flex-shrink-0`}>
                        {getStatusIcon(hasAppraisals, stats)}
                        <span className="ml-1 hidden sm:inline">{getStatusText(hasAppraisals, stats)}</span>
                        <span className="ml-1 sm:hidden">
                          {hasAppraisals ? (stats.pending > 0 ? 'Pending' : 'Done') : 'None'}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Faculty Details - Responsive */}
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0 text-gray-400" />
                        <span>Employee ID: {member.employeeCode}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0 text-gray-400" />
                        <span>
                          Joined: {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Statistics Grid - Responsive */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                        <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Appraisal Analytics
                      </h4>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-sm">
                          <div className="text-base sm:text-lg font-bold text-blue-600">{stats.total}</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-sm">
                          <div className="text-base sm:text-lg font-bold text-amber-600">{stats.pending}</div>
                          <div className="text-xs text-gray-500">Pending</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-sm">
                          <div className="text-base sm:text-lg font-bold text-green-600">{stats.approved}</div>
                          <div className="text-xs text-gray-500">Approved</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-sm">
                          <div className="text-base sm:text-lg font-bold text-red-600">{stats.rejected}</div>
                          <div className="text-xs text-gray-500">Rejected</div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons - Responsive */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      {hasAppraisals ? (
                        <>
                          <Button
                            onClick={() => navigate(`/hod/faculty/${member._id}/appraisals`)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                            size="small"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">View Appraisals</span>
                            <span className="sm:hidden">View All</span>
                          </Button>
                          {stats.pending > 0 && (
                            <Button
                              onClick={() => navigate(`/hod/faculty/${member._id}/appraisals`)}
                              variant="outline"
                              className="border-amber-200 text-amber-600 hover:bg-amber-50 sm:flex-shrink-0"
                              size="small"
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              <span className="sm:hidden">Pending: </span>
                              {stats.pending}
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="small"
                          disabled
                          className="flex-1 border-gray-200 text-gray-400 cursor-not-allowed"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">No Submissions Yet</span>
                          <span className="sm:hidden">No Submissions</span>
                        </Button>
                      )}
                    </div>
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

export default ManageFaculty;
