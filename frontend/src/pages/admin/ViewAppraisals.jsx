import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText, Eye, Calendar, User, Building2, Clock, Shield, BarChart3, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getAllAppraisalsForAdmin } from "../../utils/api";
import { showSuccessToast } from "../../utils/toast";

const ViewAppraisals = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  // NEW: search & department filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  // NEW: departments list
  const departments = [
    "Computer Science",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Information Technology",
    "Chemical Engineering",
    "Biotechnology",
    "Mathematics",
    "Physics",
    "Chemistry",
    "English",
    "Management Studies"
  ];
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchAppraisals();

    // Show success message if coming from review page
    if (location.state?.message) {
      showSuccessToast(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchAppraisals = async () => {
    try {
      const data = await getAllAppraisalsForAdmin();
      setAppraisals(data);
    } catch (err) {
      setError(err.message || "Failed to fetch appraisals");
    } finally {
      setLoading(false);
    }
  };


  const formatStatus = (status) => {
    const statusMap = {
      pending_hod: "Pending HOD Review",
      pending_admin: "Pending Admin Review",
      approved: "Approved",
      rejected: "Rejected"
    };
    return statusMap[status] || status;
  };

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

  // Helper: Check if a section is filled
  function isSectionFilled(section, fields) {
    if (!Array.isArray(section) || section.length === 0) return false;
    // For professionalMemberships (array of strings)
    if (fields.length === 0) {
      return section.some(val => val && val.trim() !== "" && val.trim().toLowerCase() !== "none");
    }
    // For object arrays
    return section.some(item =>
      fields.every(field =>
        item[field] && item[field].toString().trim() !== "" && item[field].toString().trim().toLowerCase() !== "none"
      )
    );
  }

  // Helper: Calculate completion score for an appraisal
  function getCompletionScore(appraisal) {
    let score = 0;
    requiredSections.forEach(section => {
      if (isSectionFilled(appraisal[section.key], section.fields)) score += 1;
    });
    return score;
  }

  // Helper: Get joining year for filtering
  function getJoiningYear(appraisal) {
    if (!appraisal.dateOfJoining) return null;
    try {
      return new Date(appraisal.dateOfJoining).getFullYear();
    } catch {
      return null;
    }
  }

  // --- Filter UI State ---
  const [filterType, setFilterType] = useState("department"); // department | joiningYear | completion
  const [filterValue, setFilterValue] = useState("all");
  const [sortByCompletion, setSortByCompletion] = useState(false);

  // --- Filter Options ---
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

  // --- Filtering Logic ---
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const baseFiltered = appraisals.filter(a => {
    // Filter by department/joiningYear/completion
    let matches = true;
    if (filterType === "department" && filterValue !== "all") {
      matches = a.department === filterValue;
    } else if (filterType === "joiningYear" && filterValue !== "all") {
      matches = getJoiningYear(a) && getJoiningYear(a).toString() === filterValue;
    } else if (filterType === "completion" && filterValue !== "all") {
      const score = getCompletionScore(a);
      if (filterValue === "high") matches = score >= 7;
      else if (filterValue === "medium") matches = score >= 4 && score <= 6;
      else if (filterValue === "low") matches = score >= 1 && score <= 3;
      else if (filterValue === "none") matches = score === 0;
    }
    if (!matches) return false;
    // Search
    if (!normalizedSearch) return true;
    const haystack = [
      a.faculty?.name,
      a.fullName,
      a.employeeCode,
      a.department,
      a.faculty?.email,
      a.email
    ].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  // --- Sorting Logic ---
  const sortedAppraisals = sortByCompletion
    ? [...baseFiltered].sort((a, b) => getCompletionScore(b) - getCompletionScore(a))
    : baseFiltered;

  const filteredAppraisals = filterStatus === "all"
    ? sortedAppraisals
    : sortedAppraisals.filter(a => a.status === filterStatus);

  // --- Status counts ---
  const statusCounts = {
    all: sortedAppraisals.length,
    pending_hod: sortedAppraisals.filter(a => a.status === 'pending_hod').length,
    pending_admin: sortedAppraisals.filter(a => a.status === 'pending_admin').length,
    approved: sortedAppraisals.filter(a => a.status === 'approved').length,
    rejected: sortedAppraisals.filter(a => a.status === 'rejected').length
  };

  if (loading) {
    return (
      <DashboardLayout allowedRole="admin">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">Loading all appraisals...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const departmentColors = {
    "Computer Science": "bg-blue-100 text-blue-700",
    "Electronics & Communication": "bg-purple-100 text-purple-700",
    "Mechanical Engineering": "bg-orange-100 text-orange-700",
    "Civil Engineering": "bg-green-100 text-green-700",
    "Electrical Engineering": "bg-yellow-100 text-yellow-700",
    "Information Technology": "bg-cyan-100 text-cyan-700",
    "Chemical Engineering": "bg-pink-100 text-pink-700",
    "Biotechnology": "bg-teal-100 text-teal-700",
    "Mathematics": "bg-indigo-100 text-indigo-700",
    "Physics": "bg-gray-100 text-gray-700",
    "Chemistry": "bg-red-100 text-red-700",
    "English": "bg-emerald-100 text-emerald-700",
    "Management Studies": "bg-fuchsia-100 text-fuchsia-700"
  };

  const statusConfigs = {
    pending_hod: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: AlertCircle,
      label: "Pending HOD"
    },
    pending_admin: {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: Clock,
      label: "Pending Admin"
    },
    approved: {
      color: "bg-green-100 text-green-800 border-green-300",
      icon: CheckCircle,
      label: "Approved"
    },
    rejected: {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: XCircle,
      label: "Rejected"
    }
  };

  return (
    <DashboardLayout allowedRole="admin">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="bg-white rounded-b-xl shadow-sm border-b border-gray-200 px-4 py-4 mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-7 h-7 text-red-500" />
              <span>Appraisals Management</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Review and manage all faculty appraisals</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">
              {appraisals.length} Total
            </span>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {label: "All", value: statusCounts.all, color: "bg-gray-50 text-gray-700", icon: FileText },
            { label: "Pending HOD", value: statusCounts.pending_hod, color: "bg-yellow-50 text-yellow-700", icon: AlertCircle },
            { label: "Pending Admin", value: statusCounts.pending_admin, color: "bg-blue-50 text-blue-700", icon: Clock },
            { label: "Approved", value: statusCounts.approved, color: "bg-green-50 text-green-700", icon: CheckCircle }
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`rounded-xl shadow-sm border border-gray-200 p-4 flex items-center ${card.color}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white mr-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium">{card.label}</p>
                  <p className="text-lg font-bold">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Filters/Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, employee code, email..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
            {/* Filter Type Dropdown */}
            <select
              value={filterType}
              onChange={e => {
                setFilterType(e.target.value);
                setFilterValue("all");
              }}
              className="w-full md:w-44 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
                className="w-full md:w-56 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            )}
            {filterType === "joiningYear" && (
              <select
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
                className="w-full md:w-56 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
                className="w-full md:w-56 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                {completionLevels.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
            )}
            {/* Sort by completion toggle */}
            <Button
              variant={sortByCompletion ? "primary" : "outline"}
              className={`border-red-200 text-red-600 hover:bg-red-50 ${sortByCompletion ? "bg-red-500 text-white" : ""}`}
              onClick={() => setSortByCompletion(v => !v)}
            >
              {sortByCompletion ? "Sort: Most Completed First" : "Sort by Completion"}
            </Button>
            {(searchTerm || filterValue !== "all" || filterType !== "department" || sortByCompletion) && (
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
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
          {/* Status Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              {key: 'all', label: 'All', count: statusCounts.all, config: { color: "bg-gray-100 text-gray-700", icon: FileText } },
              { key: 'pending_hod', label: 'Pending HOD', count: statusCounts.pending_hod, config: statusConfigs.pending_hod },
              { key: 'pending_admin', label: 'Pending Admin', count: statusCounts.pending_admin, config: statusConfigs.pending_admin },
              { key: 'approved', label: 'Approved', count: statusCounts.approved, config: statusConfigs.approved },
              { key: 'rejected', label: 'Rejected', count: statusCounts.rejected, config: statusConfigs.rejected }
            ].map(tab => {
              const Icon = tab.config.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border
                    ${filterStatus === tab.key
                      ? `${tab.config.color} border-2 border-red-500 shadow`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Appraisals List */}
        {filteredAppraisals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterStatus === 'all'
                ? 'No appraisals found'
                : `No ${formatStatus(filterStatus).toLowerCase()} appraisals`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filterStatus === 'all'
                ? 'Adjust search or filters to broaden results.'
                : `There are no appraisals with ${formatStatus(filterStatus).toLowerCase()} status for current filters.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppraisals.map((appraisal) => {
              const statusConfig = statusConfigs[appraisal.status] || statusConfigs.pending_hod;
              const StatusIcon = statusConfig.icon;
              const deptColor = departmentColors[appraisal.department] || "bg-gray-100 text-gray-700";
              const completionScore = getCompletionScore(appraisal);
              return (
                <div
                  key={appraisal._id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2 gap-2">
                      <User className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {appraisal.faculty?.name || appraisal.fullName}
                      </h3>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${deptColor}`}>
                        {appraisal.department}
                      </span>
                      <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        Completion: {completionScore}/10
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span>{appraisal.department}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>{appraisal.employeeCode}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(appraisal.submissionDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                      <span>Research: {appraisal.researchPublications?.length || 0}</span>
                      <span>Projects: {appraisal.projects?.length || 0}</span>
                      <span>Awards: {appraisal.awardsRecognitions?.length || 0}</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color} mt-2`}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </span>
                  </div>
                  {/* Right: Actions */}
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col gap-2">
                    <Button
                      onClick={() => navigate(`/admin/appraisal/${appraisal._id}`)}
                      className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white text-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review Appraisal
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results Summary */}
        {filteredAppraisals.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredAppraisals.length} of {appraisals.length} appraisals
            {searchTerm && ` matching "${searchTerm}"`}
            {filterType === "department" && filterValue !== "all" && ` in "${filterValue}"`}
            {filterType === "joiningYear" && filterValue !== "all" && ` joined in "${filterValue}"`}
            {filterType === "completion" && filterValue !== "all" && ` with "${completionLevels.find(l => l.key === filterValue)?.label}"`}
            {filterStatus !== "all" && ` with status "${statusConfigs[filterStatus]?.label || filterStatus}"`}
            {sortByCompletion && " (sorted by completion)"}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewAppraisals;
