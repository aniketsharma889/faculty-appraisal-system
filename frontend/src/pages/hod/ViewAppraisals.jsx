import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FileText, 
  Eye, 
  Calendar, 
  User, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  Users,
  Filter,
  Search
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getHODAppraisals } from "../../utils/api";

const ViewAppraisals = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("submissionDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterType, setFilterType] = useState("department"); // department | joiningYear | completion
  const [filterValue, setFilterValue] = useState("all");
  const [sortByCompletion, setSortByCompletion] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const data = await getHODAppraisals();
      setAppraisals(data);
    } catch (err) {
      setError(err.message || "Failed to fetch appraisals");
    } finally {
      setLoading(false);
    }
  };

  // Section completion logic (same as admin)
  const requiredSections = [
    { key: "academicQualifications", fields: ["degree", "institution", "yearOfPassing"] },
    { key: "researchPublications", fields: ["title"] },
    { key: "seminars", fields: ["title"] },
    { key: "projects", fields: ["title"] },
    { key: "lectures", fields: ["topic"] },
    { key: "awardsRecognitions", fields: ["title"] },
    { key: "professionalMemberships", fields: [] },
    { key: "coursesTaught", fields: ["courseName"] },
    { key: "administrativeResponsibilities", fields: ["role"] },
    { key: "studentMentoring", fields: ["studentName"] }
  ];

  function isSectionFilled(section, fields) {
    if (!Array.isArray(section) || section.length === 0) return false;
    if (fields.length === 0) {
      return section.some(val => val && val.trim() !== "" && val.trim().toLowerCase() !== "none");
    }
    return section.some(item =>
      fields.every(field =>
        item[field] && item[field].toString().trim() !== "" && item[field].toString().trim().toLowerCase() !== "none"
      )
    );
  }

  function getCompletionScore(appraisal) {
    let score = 0;
    requiredSections.forEach(section => {
      if (isSectionFilled(appraisal[section.key], section.fields)) score += 1;
    });
    return score;
  }

  function getJoiningYear(appraisal) {
    if (!appraisal.dateOfJoining) return null;
    try {
      return new Date(appraisal.dateOfJoining).getFullYear();
    } catch {
      return null;
    }
  }

  // Statistics calculation
  const stats = {
    total: appraisals.length,
    pending_hod: appraisals.filter(a => a.status === 'pending_hod').length,
    pending_admin: appraisals.filter(a => a.status === 'pending_admin').length,
    approved: appraisals.filter(a => a.status === 'approved').length,
    rejected: appraisals.filter(a => a.status === 'rejected').length
  };

  // Filter options
  const joiningYears = Array.from(new Set(appraisals
    .map(a => getJoiningYear(a))
    .filter(Boolean)
  )).sort((a, b) => b - a);

  const completionLevels = [
    { key: "all", label: "All Completion Levels" },
    { key: "high", label: "Highly Completed (7+ sections)" },
    { key: "medium", label: "Moderately Completed (4-6 sections)" },
    { key: "low", label: "Low Completion (1-3 sections)" },
    { key: "none", label: "No Details" }
  ];

  // Filtering and sorting
  const normalizedSearch = searchTerm.trim().toLowerCase();
  let filteredBase = appraisals.filter(appraisal => {
    let matches = true;
    if (filterType === "department" && filterValue !== "all") {
      matches = appraisal.department === filterValue;
    } else if (filterType === "joiningYear" && filterValue !== "all") {
      matches = getJoiningYear(appraisal) && getJoiningYear(appraisal).toString() === filterValue;
    } else if (filterType === "completion" && filterValue !== "all") {
      const score = getCompletionScore(appraisal);
      if (filterValue === "high") matches = score >= 7;
      else if (filterValue === "medium") matches = score >= 4 && score <= 6;
      else if (filterValue === "low") matches = score >= 1 && score <= 3;
      else if (filterValue === "none") matches = score === 0;
    }
    if (!matches) return false;
    if (!normalizedSearch) return true;
    return (
      (appraisal.fullName && appraisal.fullName.toLowerCase().includes(normalizedSearch)) ||
      (appraisal.employeeCode && appraisal.employeeCode.toLowerCase().includes(normalizedSearch)) ||
      (appraisal.designation && appraisal.designation.toLowerCase().includes(normalizedSearch))
    );
  });

  // Status filter
  filteredBase = filteredBase.filter(appraisal => {
    return filterStatus === "all" || appraisal.status === filterStatus;
  });

  // Sorting logic
  let filteredAndSortedAppraisals = [...filteredBase];
  if (sortByCompletion) {
    filteredAndSortedAppraisals.sort((a, b) => getCompletionScore(b) - getCompletionScore(a));
  } else {
    filteredAndSortedAppraisals.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === 'submissionDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  const getStatusConfig = (status) => {
    const configs = {
      pending_hod: {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        icon: AlertCircle,
        label: "Pending Review"
      },
      pending_admin: {
        color: "bg-blue-100 text-blue-800 border-blue-300", 
        icon: Clock,
        label: "Sent to Admin"
      },
      approved: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: CheckCircle,
        label: "Approved"
      },
      rejected: {
        color: "bg-rose-100 text-rose-800 border-rose-300",
        icon: XCircle,
        label: "Rejected"
      }
    };
    return configs[status] || configs.pending_hod;
  };

  const getPriorityLevel = (status, submissionDate) => {
    if (status !== 'pending_hod') return null;
    
    const daysSince = Math.floor((new Date() - new Date(submissionDate)) / (1000 * 60 * 60 * 24));
    
    if (daysSince >= 7) return { level: "High", color: "text-red-600", bg: "bg-red-100" };
    if (daysSince >= 3) return { level: "Medium", color: "text-amber-600", bg: "bg-amber-100" };
    return { level: "Normal", color: "text-green-600", bg: "bg-green-100" };
  };

  if (loading) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
                <span className="text-gray-600">Loading department appraisals...</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Remove duplicate empty state rendering
  const showEmptyState = filteredAndSortedAppraisals.length === 0;

  return (
    <DashboardLayout allowedRole="hod">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          
          {/* Enhanced Header - Responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center justify-center lg:justify-start">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-green-600" />
                  Department Appraisals
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Review and manage faculty appraisals in your department
                </p>
              </div>
              
              <div className="flex items-center justify-center lg:justify-end">
                <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {appraisals.length} Total
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          {/* Statistics Cards - Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:items-start">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2 lg:mb-0 lg:mr-4">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Total Submissions</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:items-start">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-2 lg:mb-0 lg:mr-4">
                  <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Pending Review</p>
                  <p className="text-lg sm:text-2xl font-bold text-amber-600">{stats.pending_hod}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:items-start">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2 lg:mb-0 lg:mr-4">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Sent to Admin</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.pending_admin}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:items-start">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-2 lg:mb-0 lg:mr-4">
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-600">{stats.approved}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters/Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Search - Full width on mobile */}
              <div className="relative w-full lg:flex-1 lg:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, employee code, or designation..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              {/* Filter Type Dropdown */}
              <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4 lg:space-x-4">
                <select
                  value={filterType}
                  onChange={e => {
                    setFilterType(e.target.value);
                    setFilterValue("all");
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto min-w-0"
                >
                  <option value="department">Department</option>
                  <option value="joiningYear">Joining Year</option>
                  <option value="completion">Appraisal Completion</option>
                </select>
                {/* Filter Value Dropdown */}
                {filterType === "department" && (
                  <select
                    value={filterValue}
                    onChange={e => setFilterValue(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto min-w-0"
                  >
                    <option value="all">All Departments</option>
                    {[...new Set(appraisals.map(a => a.department))].map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                )}
                {filterType === "joiningYear" && (
                  <select
                    value={filterValue}
                    onChange={e => setFilterValue(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto min-w-0"
                  >
                    <option value="all">All Years</option>
                    {joiningYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                )}
                {filterType === "completion" && (
                  <select
                    value={filterValue}
                    onChange={e => setFilterValue(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto min-w-0"
                  >
                    {completionLevels.map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                )}
                {/* Sort by completion toggle */}
                <Button
                  variant={sortByCompletion ? "primary" : "outline"}
                  className={`border-green-200 text-green-600 hover:bg-green-50 ${sortByCompletion ? "bg-green-600 text-white" : ""}`}
                  onClick={() => setSortByCompletion(v => !v)}
                >
                  {sortByCompletion ? "Sort: Most Completed First" : "Sort by Completion"}
                </Button>
                {(searchTerm || filterValue !== "all" || filterType !== "department" || sortByCompletion) && (
                  <Button
                    variant="outline"
                    className="border-green-200 text-green-600 hover:bg-green-50"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("department");
                      setFilterValue("all");
                      setSortByCompletion(false);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {/* Status filters - pills */}
              {Object.keys(stats).map(key => {
                if (key === "total") return null;
                const statusConfig = getStatusConfig(key);
                return (
                  <Button
                    key={key}
                    variant={filterStatus === key ? "primary" : "outline"}
                    className={`border-${statusConfig.color.split(' ')[0]} text-${statusConfig.color.split(' ')[0]}-600 hover:bg-${statusConfig.color.split(' ')[0]}-50 flex items-center space-x-2`}
                    onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
                  >
                    <statusConfig.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{statusConfig.label} ({stats[key]})</span>
                    {filterStatus === key && (
                      <XCircle className="w-4 h-4 text-red-500 ml-1" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Error or empty state */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}
          {showEmptyState && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterValue !== "all" ? 'No appraisals match your criteria' : 'No appraisals found'}
              </h3>
              <p className="text-gray-500 mb-6 text-sm sm:text-base">
                {searchTerm || filterValue !== "all" 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No faculty members in your department have submitted appraisals yet.'
                }
              </p>
              {(searchTerm || filterValue !== "all") && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterValue('all');
                  }}
                  variant="outline"
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Appraisals List */}
          {!showEmptyState && (
            <div className="space-y-4 sm:space-y-6">
              {filteredAndSortedAppraisals.map((appraisal) => {
                const statusConfig = getStatusConfig(appraisal.status);
                const StatusIcon = statusConfig.icon;
                const priority = getPriorityLevel(appraisal.status, appraisal.submissionDate);
                const completionScore = getCompletionScore(appraisal);
                return (
                  <div
                    key={appraisal._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                      
                      {/* Left Section - Main Info */}
                      <div className="flex-1 space-y-3 lg:space-y-0">
                        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 flex-shrink-0" />
                            {appraisal.fullName}
                          </h3>
                          
                          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-2">
                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color} w-fit`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </span>
                            
                            {priority && (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color} w-fit`}>
                                {priority.level} Priority
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 w-fit">
                              Completion: {completionScore}/10
                            </span>
                          </div>
                        </div>

                        {/* Details Grid - Responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{appraisal.department}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{appraisal.employeeCode}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(appraisal.submissionDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Summary Stats - Responsive */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>Publications: {appraisal.researchPublications?.length || 0}</span>
                          <span>Projects: {appraisal.projects?.length || 0}</span>
                          <span>Awards: {appraisal.awardsRecognitions?.length || 0}</span>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3 lg:flex-col lg:space-x-0 lg:space-y-2 lg:ml-6">
                        <Button
                          onClick={() => navigate(`/hod/appraisal/${appraisal._id}`)}
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Review Details</span>
                          <span className="sm:hidden">Review</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Results Summary */}
          {filteredAndSortedAppraisals.length > 0 && (
            <div className="mt-6 sm:mt-8 text-center text-sm text-gray-500">
              Showing {filteredAndSortedAppraisals.length} of {appraisals.length} appraisals
              {searchTerm && ` matching "${searchTerm}"`}
              {filterType === "department" && filterValue !== "all" && ` in "${filterValue}"`}
              {filterType === "joiningYear" && filterValue !== "all" && ` joined in "${filterValue}"`}
              {filterType === "completion" && filterValue !== "all" && ` with "${completionLevels.find(l => l.key === filterValue)?.label}"`}
              {filterStatus !== "all" && ` with status "${getStatusConfig(filterStatus).label}"`}
              {sortByCompletion && " (sorted by completion)"}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewAppraisals;