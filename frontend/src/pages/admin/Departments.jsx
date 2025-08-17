import { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Crown, 
  Search, 
  Eye,
  Mail,
  Calendar,
  Shield,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getDepartments } from "../../utils/api";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [overallStats, setOverallStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDept, setExpandedDept] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortFilter, setSortFilter] = useState("Default");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getDepartments();
      setDepartments(response.departments || []);
      setOverallStats(response.overallStats || {});
    } catch (err) {
      setError(err.message || "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDepartments();
    setTimeout(() => setRefreshing(false), 600);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'hod':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'faculty':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'hod':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'faculty':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const sortOptions = [
    { value: "Default", label: "Default" },
    { value: "MostUsers", label: "Most Users" },
    { value: "MostFaculty", label: "Most Faculty" },
    { value: "MostHODs", label: "Most HODs" }
  ];

  // Sorting logic
  const sortedDepartments = [...departments].sort((a, b) => {
    if (sortFilter === "MostUsers") {
      return b.stats.totalUsers - a.stats.totalUsers;
    }
    if (sortFilter === "MostFaculty") {
      return b.stats.totalFaculty - a.stats.totalFaculty;
    }
    if (sortFilter === "MostHODs") {
      return b.stats.totalHODs - a.stats.totalHODs;
    }
    return 0;
  });

  const filteredDepartments = sortedDepartments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.users.some(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <DashboardLayout allowedRole="admin">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">Loading departments...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Add department color mapping for card borders
  const deptColors = {
    "Computer Science": "border-blue-400",
    "Electronics & Communication": "border-purple-400",
    "Mechanical Engineering": "border-orange-400",
    "Civil Engineering": "border-green-400",
    "Electrical Engineering": "border-yellow-400",
    "Information Technology": "border-cyan-400",
    "Chemical Engineering": "border-pink-400",
    "Biotechnology": "border-teal-400",
    "Mathematics": "border-indigo-400",
    "Physics": "border-gray-400",
    "Chemistry": "border-red-400",
    "English": "border-emerald-400",
    "Management Studies": "border-fuchsia-400"
  };

  return (
    <DashboardLayout allowedRole="admin">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Departments</p>
              <p className="text-2xl font-bold">{overallStats.totalDepartments || 0}</p>
            </div>
            <Building2 className="w-8 h-8 text-red-200" />
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{overallStats.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Faculty</p>
              <p className="text-2xl font-bold">{overallStats.totalFaculty || 0}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-emerald-200" />
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">HODs</p>
              <p className="text-2xl font-bold">{overallStats.totalHODs || 0}</p>
            </div>
            <Crown className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center">
              <Building2 className="w-8 h-8 mr-3 text-red-500" />
              Departments
            </h1>
            <p className="text-gray-600 mt-2">Manage departments and their members</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-100 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="flex items-center bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <Building2 className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                {overallStats.totalDepartments} Departments
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search & Sort Filter */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:space-x-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full shadow"
            />
          </div>
          <div className="w-full md:w-auto">
            <select
              value={sortFilter}
              onChange={e => setSortFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Departments List */}
        {filteredDepartments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No departments found" : "No departments available"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No departments match your search for "${searchTerm}"`
                : "Departments will appear here once users are assigned to departments"
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-red-600 hover:text-red-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredDepartments.map((department) => (
              <div
                key={department.name}
                className={`border-2 rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-200 hover:shadow-xl bg-white ${deptColors[department.name] || "border-gray-200"}`}
              >
                {/* Department Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Building2 className="w-6 h-6 mr-3 text-red-500" />
                      {department.name}
                    </h3>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {department.stats.totalUsers} Users
                      </span>
                      <span className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {department.stats.totalFaculty} Faculty
                      </span>
                      <span className="flex items-center">
                        <Crown className="w-4 h-4 mr-1" />
                        {department.stats.totalHODs} HODs
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setExpandedDept(expandedDept === department.name ? null : department.name)}
                    variant="outline"
                    className={`border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200 ${expandedDept === department.name ? "bg-red-50" : ""}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {expandedDept === department.name ? 'Hide Users' : 'View Users'}
                  </Button>
                </div>

                {/* Department Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center shadow">
                    <div className="text-2xl font-bold text-blue-600">{department.stats.totalUsers}</div>
                    <div className="text-xs text-blue-500">Total Users</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 text-center shadow">
                    <div className="text-2xl font-bold text-emerald-600">{department.stats.totalFaculty}</div>
                    <div className="text-xs text-emerald-500">Faculty Members</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center shadow">
                    <div className="text-2xl font-bold text-purple-600">{department.stats.totalHODs}</div>
                    <div className="text-xs text-purple-500">HODs</div>
                  </div>
                </div>

                {/* Users List (Expandable) */}
                {expandedDept === department.name && (
                  <div className="border-t border-gray-200 pt-6 mt-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Department Members</h4>
                    {department.users.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No users in this department</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {department.users.map((user) => (
                          <div
                            key={user.id}
                            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between hover:shadow transition-all duration-200"
                          >
                            {/* Avatar and Info */}
                            <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto">
                              <div className="w-14 h-14 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold mb-2 sm:mb-0 sm:mr-3 text-xl sm:text-lg shadow">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-center sm:text-left">
                                <h5 className="font-semibold text-gray-900">{user.name}</h5>
                                <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {user.email}
                                </div>
                                <div className="flex items-center justify-center sm:justify-start text-xs text-gray-500 mt-1">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            {/* Role & View Button */}
                            <div className="flex flex-row sm:flex-col items-end space-x-2 sm:space-x-0 sm:space-y-2 mt-2 sm:mt-0">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)} shadow`}>
                                {getRoleIcon(user.role)}
                                <span className="ml-1 capitalize">{user.role}</span>
                              </span>
                              <Button
                                variant="outline"
                                size="small"
                                onClick={() => navigate(`/admin/user/${user.id}`)}
                                className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Departments;
