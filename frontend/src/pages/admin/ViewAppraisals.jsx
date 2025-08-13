import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Eye, Calendar, User, Building2, Clock, Shield } from "lucide-react";
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

  const getStatusColor = (status) => {
    const colors = {
      pending_hod: "bg-yellow-100 text-yellow-800 border-yellow-300",
      pending_admin: "bg-blue-100 text-blue-800 border-blue-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
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

  // REPLACED filtering logic: first apply search + department, then status
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const baseFiltered = appraisals.filter(a => {
    const matchesDept = departmentFilter === "all" || a.department === departmentFilter;
    if (!matchesDept) return false;
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

  const filteredAppraisals = filterStatus === "all"
    ? baseFiltered
    : baseFiltered.filter(a => a.status === filterStatus);

  // Status counts now reflect current search + department subset
  const statusCounts = {
    all: baseFiltered.length,
    pending_hod: baseFiltered.filter(a => a.status === 'pending_hod').length,
    pending_admin: baseFiltered.filter(a => a.status === 'pending_admin').length,
    approved: baseFiltered.filter(a => a.status === 'approved').length,
    rejected: baseFiltered.filter(a => a.status === 'rejected').length
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

  return (
    <DashboardLayout allowedRole="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-red-500" />
                All Appraisals
              </h1>
              <p className="text-gray-600 mt-1">Review and manage all faculty appraisals</p>
            </div>
            <div className="flex items-center mt-4 sm:mt-0">
              <FileText className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">
                Total: {appraisals.length} appraisals
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* NEW: Search & Department Filters */}
          <div className="mb-6 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by name, employee code, email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="w-full md:w-72">
                <select
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
              {(searchTerm || departmentFilter !== 'all') && (
                <button
                  onClick={() => { setSearchTerm(""); setDepartmentFilter("all"); }}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Existing Status Tabs (unchanged except using new counts) */}
            <div>
              <div className="flex flex-wrap gap-2">
                {[{
                  key: 'all', label: 'All', count: statusCounts.all },
                  { key: 'pending_hod', label: 'Pending HOD', count: statusCounts.pending_hod },
                  { key: 'pending_admin', label: 'Pending Admin', count: statusCounts.pending_admin },
                  { key: 'approved', label: 'Approved', count: statusCounts.approved },
                  { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterStatus(filter.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === filter.key
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredAppraisals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filterStatus === 'all'
                  ? 'No appraisals found'
                  : `No ${formatStatus(filterStatus).toLowerCase()} appraisals`}
              </h3>
              <p className="text-gray-500">
                {filterStatus === 'all'
                  ? 'Adjust search or filters to broaden results.'
                  : `There are no appraisals with ${formatStatus(filterStatus).toLowerCase()} status for current filters.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppraisals.map((appraisal) => (
                <div
                  key={appraisal._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <User className="w-5 h-5 text-blue-500 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {appraisal.faculty?.name || appraisal.fullName}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          <span>Department: {appraisal.department}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>Employee Code: {appraisal.employeeCode}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            Submitted: {new Date(appraisal.submissionDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            appraisal.status
                          )}`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {formatStatus(appraisal.status)}
                        </span>
                        
                        <div className="text-xs text-gray-500">
                          Research: {appraisal.researchPublications?.length || 0} | 
                          Projects: {appraisal.projects?.length || 0} | 
                          Awards: {appraisal.awardsRecognitions?.length || 0}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <Button
                        onClick={() => navigate(`/admin/appraisal/${appraisal._id}`)}
                        className="w-full lg:w-auto bg-red-500 hover:bg-red-600"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review Appraisal
                      </Button>
                    </div>
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

export default ViewAppraisals;
