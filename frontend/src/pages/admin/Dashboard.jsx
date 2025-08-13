import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, FileText, Users, Settings, BarChart3, Shield, Activity, RefreshCw, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getAdminDashboardStats, getAllAppraisalsForAdmin, getAllUsers } from "../../utils/api";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppraisals: 0,
    pendingHOD: 0,
    pendingAdmin: 0,
    approved: 0,
    rejected: 0
  });
  const [recent, setRecent] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!token || !storedUser) {
      navigate("/");
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      navigate("/");
      return;
    }
    
    setUser(userData);
  }, [navigate]);


  useEffect(() => {
    if (user) fetchAll();
  }, [user]);
  

  const fetchAll = async () => {
    setLoadingData(true);
    setError("");
    try {
      let dashboard;
      try {
        dashboard = await getAdminDashboardStats();
      } catch {
        // Fallback: calculate stats from individual API calls
        const [appraisals = [], users = []] = await Promise.all([
          getAllAppraisalsForAdmin().catch(() => []),
          getAllUsers().catch(() => [])
        ]);
        dashboard = {
          stats: {
            totalUsers: users.length,
            totalAppraisals: appraisals.length,
            pendingHOD: appraisals.filter(a => a.status === "pending_hod").length,
            pendingAdmin: appraisals.filter(a => a.status === "pending_admin").length,
            approved: appraisals.filter(a => a.status === "approved").length,
            rejected: appraisals.filter(a => a.status === "rejected").length
          },
          recentAppraisals: appraisals
            .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
            .slice(0, 8)
        };
      }
      if (dashboard?.stats) setStats(dashboard.stats);
      if (dashboard?.recentAppraisals) setRecent(dashboard.recentAppraisals);
    } catch (e) {
      setError(e.message || "Failed loading dashboard data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setTimeout(() => setRefreshing(false), 600);
  };

  const successRate = useMemo(() => {
    if (!stats.totalAppraisals) return 0;
    return Math.round(
      (stats.approved / stats.totalAppraisals) * 100
    );
  }, [stats]);

  const filteredRecent = useMemo(() => {
    return recent.filter(r => {
      const term = search.toLowerCase();
      const matches =
        !term ||
        r.fullName?.toLowerCase().includes(term) ||
        r.employeeCode?.toLowerCase().includes(term) ||
        r.department?.toLowerCase().includes(term);
      const statusOk =
        statusFilter === "all" || r.status === statusFilter;
      return matches && statusOk;
    });
  }, [recent, search, statusFilter]);

  const statusBadge = (s) => {
    const map = {
      pending_hod: "bg-amber-100 text-amber-700 border-amber-200",
      pending_admin: "bg-blue-100 text-blue-700 border-blue-200",
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      rejected: "bg-rose-100 text-rose-700 border-rose-200"
    };
    return map[s] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const fmtStatus = (s) =>
    ({
      pending_hod: "Pending HOD",
      pending_admin: "Pending Admin",
      approved: "Approved",
      rejected: "Rejected"
    }[s] || s);

  if (!user) return <div>Loading...</div>;

  return (
    <DashboardLayout allowedRole="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-2 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-500" />
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Monitor and manage the appraisal ecosystem
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-100 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-2xl p-6 sm:p-8 mb-8 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_60%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-center">
            <div className="flex items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-2xl">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <h2 className="text-white text-xl sm:text-2xl font-semibold">
                  Welcome back, {user.name}
                </h2>
                <p className="text-pink-100 text-sm">
                  {loadingData
                    ? "Loading system insights..."
                    : "All systems operational."}
                </p>
              </div>
            </div>
            <div className="sm:ml-auto mt-4 sm:mt-0 text-white">
              <div className="text-sm uppercase tracking-wide opacity-80">
                Success Rate
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{successRate}%</span>
                <span className="text-pink-100 text-xs pb-1">
                  of submissions approved
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-emerald-300/90 rounded-full transition-all duration-700"
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-rose-300 bg-rose-50 text-rose-700 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Data Load Error</p>
              <p className="text-xs">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="text-rose-700 text-xs underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[
            {
              label: "Users",
              value: stats.totalUsers,
              icon: Users,
              color: "from-blue-500 to-indigo-600"
            },
          {
            label: "Appraisals",
            value: stats.totalAppraisals,
            icon: FileText,
            color: "from-violet-500 to-fuchsia-600"
          },
          {
            label: "Pending HOD",
            value: stats.pendingHOD,
            icon: Clock,
            color: "from-amber-500 to-orange-600"
          },
          {
            label: "Pending Admin",
            value: stats.pendingAdmin,
            icon: Activity,
            color: "from-sky-500 to-cyan-600"
          },
          {
            label: "Approved",
            value: stats.approved,
            icon: CheckCircle,
            color: "from-emerald-500 to-green-600"
          },
          {
            label: "Rejected",
            value: stats.rejected,
            icon: XCircle,
            color: "from-rose-500 to-red-600"
          }
        
        ].map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="group relative overflow-hidden rounded-xl p-4 bg-white border border-gray-200 shadow hover:shadow-md transition"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.color}`}
                />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {c.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {loadingData ? (
                        <span className="inline-block w-10 h-6 bg-gray-200 animate-pulse rounded" />
                      ) : (
                        c.value
                      )}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${c.color} text-white shadow-inner`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="space-y-8 lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-800">
                  Admin Actions
                </h2>
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full bg-red-500 hover:bg-red-600 text-white text-sm"
                  onClick={() => navigate("/admin/view-appraisals")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Appraisals
                </Button>
                <Button
                  variant="secondary"
                  className="w-full text-sm"
                  onClick={() => navigate("/admin/manage-users")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 text-sm"
                  onClick={() => navigate("/admin/departments")}
                >
                  Departments
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                  onClick={() => navigate("/admin/profile")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile / Settings
                </Button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  System Overview
                </h3>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500">
                    Throughput
                  </span>
                  <span className="font-medium text-gray-800">
                    {stats.totalAppraisals
                      ? ((stats.approved + stats.rejected) /
                          stats.totalAppraisals *
                          100).toFixed(0)
                      : 0}
                    %
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">
                    Approval Ratio
                  </span>
                  <span className="font-medium text-emerald-600">
                    {stats.approved}:{stats.rejected || 1}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">
                    Pending Queue
                  </span>
                  <span className="font-medium text-amber-600">
                    {stats.pendingHOD + stats.pendingAdmin}
                  </span>
                </li>
              </ul>
              <div className="mt-5">
                <p className="text-xs mb-2 text-gray-500">
                  Processing Progress
                </p>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-700"
                    style={{
                      width: `${
                        stats.totalAppraisals
                          ? ((stats.approved + stats.rejected) /
                              stats.totalAppraisals) *
                            100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow flex flex-col h-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Appraisals
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full sm:w-40 pl-3 pr-8 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending_hod">Pending HOD</option>
                      <option value="pending_admin">Pending Admin</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {loadingData && (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-16 rounded-xl bg-gray-100 animate-pulse"
                      />
                    ))}
                  </div>
                )}

                {!loadingData && filteredRecent.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
                    <FileText className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      No matching recent appraisals
                    </p>
                  </div>
                )}

                {!loadingData &&
                  filteredRecent.map((a) => (
                    <div
                      key={a._id}
                      className="group border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {a.fullName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {a.department} • {a.designation}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Submitted:{" "}
                          {new Date(a.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-medium border ${statusBadge(
                            a.status
                          )}`}
                        >
                          {fmtStatus(a.status)}
                        </span>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() =>
                            navigate(`/admin/appraisal/${a._id}`)
                          }
                          className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate("/admin/view-appraisals")}
                  className="text-xs"
                >
                  View All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

