import { useState, useEffect } from "react";
import { 
  Users, 
  Mail, 
  Building2, 
  Calendar, 
  Search, 
  Filter,
  UserCheck,
  Shield,
  GraduationCap,
  Crown,
  Eye,
  X,
  User
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getAllUsers } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getAllUsers();
      setUsers(userData);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
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
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'hod':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'faculty':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name?.localeCompare(b.name) || 0;
      if (sortBy === "email") return a.email?.localeCompare(b.email) || 0;
      if (sortBy === "role") return a.role?.localeCompare(b.role) || 0;
      if (sortBy === "department") return a.department?.localeCompare(b.department) || 0;
      if (sortBy === "joinDate") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    hods: users.filter(u => u.role === 'hod').length,
    faculty: users.filter(u => u.role === 'faculty').length
  };

  const handleViewUser = (userId, userRole) => {
    // Disable view for admin users
    if (userRole === 'admin') {
      return;
    }
    navigate(`/admin/user/${userId}`);
  };

  if (loading) {
    return (
      <DashboardLayout allowedRole="admin">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">Loading users...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="admin">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 sm:mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-red-500" />
                Manage Users
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Oversee all system users and their details</p>
            </div>
            <div className="flex items-center bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              <Users className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium text-sm sm:text-base">
                Total Users: {userStats.total}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-3 sm:p-4 text-white shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs sm:text-sm">Admins</p>
                  <p className="text-xl sm:text-2xl font-bold">{userStats.admins}</p>
                </div>
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-red-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-3 sm:p-4 text-white shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">HODs</p>
                  <p className="text-xl sm:text-2xl font-bold">{userStats.hods}</p>
                </div>
                <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-purple-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 sm:p-4 text-white shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">Faculty</p>
                  <p className="text-xl sm:text-2xl font-bold">{userStats.faculty}</p>
                </div>
                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-3 sm:p-4 text-white shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs sm:text-sm">Active</p>
                  <p className="text-xl sm:text-2xl font-bold">{userStats.total}</p>
                </div>
                <UserCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-200" />
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
                />
              </div>
              <div className="flex space-x-2 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="role">Sort by Role</option>
                  <option value="department">Sort by Department</option>
                  <option value="joinDate">Sort by Join Date</option>
                </select>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="hod">HODs</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          {filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {searchTerm || roleFilter !== "all" ? "No users found" : "No users in the system"}
              </h3>
              <p className="text-gray-500 text-sm">
                {searchTerm || roleFilter !== "all"
                  ? "No users match your current search and filter criteria"
                  : "Users will appear here once they are added to the system"
                }
              </p>
              {(searchTerm || roleFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                  }}
                  className="mt-4 text-red-600 hover:text-red-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Employee Code
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="relative px-3 sm:px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <div className="font-medium text-gray-900 truncate">{user.name}</div>
                            <div className="text-gray-500 flex items-center truncate">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium border ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-900">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {user.department || 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">
                          {user.employeeCode || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right font-medium">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleViewUser(user._id, user.role)}
                          disabled={user.role === 'admin'}
                          className={`border-red-200 text-red-600 hover:bg-red-50 ${
                            user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title={user.role === 'admin' ? 'Cannot view admin user details' : 'View user details'}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                          <span className="sm:hidden">👁️</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
