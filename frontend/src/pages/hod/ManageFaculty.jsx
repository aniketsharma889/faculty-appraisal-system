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
  Clock
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
      pending: facultyAppraisals.filter(a => a.status === 'pending_hod').length,
      approved: facultyAppraisals.filter(a => a.status === 'approved').length,
      rejected: facultyAppraisals.filter(a => a.status === 'rejected').length
    };
  };

  const getStatusColor = (hasAppraisals, stats) => {
    // Updated: completed = approved OR rejected
    if (!hasAppraisals) return "bg-gray-100 text-gray-800 border-gray-300";
    if (stats.pending > 0) return "bg-amber-100 text-amber-800 border-amber-300";
    if (stats.approved > 0 || stats.rejected > 0) return "bg-green-100 text-green-800 border-green-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusText = (hasAppraisals, stats) => {
    // Updated per requirements
    if (!hasAppraisals) return "No Submissions";
    if (stats.pending > 0) return `${stats.pending} Pending Review`;
    if (stats.approved > 0 || stats.rejected > 0) return "Completed";
    return "No Submissions";
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
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name?.localeCompare(b.name) || 0;
      if (sortBy === "email") return a.email?.localeCompare(b.email) || 0;
      if (sortBy === "employeeCode") return a.employeeCode?.localeCompare(b.employeeCode) || 0;
      if (sortBy === "joinDate") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  if (loading) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">Loading faculty members...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout allowedRole="hod">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center">
                <Users className="w-8 h-8 mr-3 text-green-600" />
                Manage Faculty
              </h1>
              <p className="text-gray-600 mt-2">Oversee faculty members in your department</p>
            </div>
            <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <Building2 className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Total Faculty: {faculty.length}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-6 md:top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                />
              </div>
              
              <div className="flex space-x-3 flex-col md:flex-row">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="employeeCode">Sort by Employee Code</option>
                  <option value="joinDate">Sort by Join Date</option>
                </select>
                
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Faculty</option>
                  <option value="active">With Submissions</option>
                  <option value="inactive">No Submissions</option>
                  <option value="pending">Pending Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* Faculty Grid */}
          {filteredAndSortedFaculty.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No faculty members found" : "No faculty members in your department"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? `No faculty members match your search for "${searchTerm}"`
                  : "Faculty members will appear here once they are added to your department"
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedFaculty.map((member) => {
                const stats = getFacultyStats(member._id);
                const hasAppraisals = stats.total > 0;
                
                return (
                  <div
                    key={member._id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-green-200 transition-all duration-200"
                  >
                    {/* Faculty Header */}
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {member.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(hasAppraisals, stats)}`}
                        >
                          {getStatusText(hasAppraisals, stats)}
                        </span>
                      </div>
                    </div>

                    {/* Faculty Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Employee ID: {member.employeeCode}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          Joined: {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Appraisal Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-amber-600">{stats.pending}</div>
                          <div className="text-xs text-gray-500">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{stats.approved}</div>
                          <div className="text-xs text-gray-500">Approved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{stats.rejected}</div>
                          <div className="text-xs text-gray-500">Rejected</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                      {hasAppraisals ? (
                        <Button
                          onClick={() => navigate("/hod/view-appraisals")}
                          variant="outline"
                          size="small"
                          className="border-green-200 text-green-600 hover:bg-green-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Appraisals
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="small"
                          disabled
                          className="border-gray-200 text-gray-400"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          No Submissions
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
