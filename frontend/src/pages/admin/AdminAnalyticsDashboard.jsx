import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getAllUsers, getAdminDashboardStats, getDepartments, getAllAppraisalsForAdmin } from "../../utils/api";
import {
  Users,
  BarChart3,
  PieChart,
  FileText,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  LineChart,
  TrendingUp,
  AlertCircle,
  Download,
  FileDown,
  Table,
  XCircle as XCircleIcon
} from "lucide-react";
import html2pdf from 'html2pdf.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Color palette for department bars (up to 10)
const deptBarColors = [
  "#2563eb", // blue
  "#a21caf", // purple
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#3b82f6", // sky
  "#eab308", // yellow
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#db2777", // pink
];

// Enhanced Card with icon
const Card = ({ title, icon: Icon, children, color, details }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col hover:shadow-lg transition-all duration-200">
    <div className="flex items-center mb-3">
      {Icon && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3 ${color || "bg-gray-100"}`}>
          <Icon className={`w-5 h-5 ${color ? "text-white" : "text-gray-500"}`} />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="flex-1 flex flex-col">{children}</div>
    {details && (
      <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-700">
        {details}
      </div>
    )}
  </div>
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // 🔥 hides the legend
    },
    title: {
      display: false,
    },
  },
};


const horizontalBarOptions = {
  ...chartOptions,
  indexAxis: "y",
};

const stackedBarOptions = {
  ...chartOptions,
  scales: {
    x: { stacked: true },
    y: { stacked: true, beginAtZero: true },
  },
};

const groupedBarOptions = {
  ...chartOptions,
  scales: {
    x: { beginAtZero: true },
    y: { beginAtZero: true },
  },
};

const lineOptions = {
  ...chartOptions,
  scales: {
    y: { beginAtZero: true },
  },
};

const AdminAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userStats, setUserStats] = useState({ admins: 0, hods: 0, faculty: 0 });
  const [appraisalStats, setAppraisalStats] = useState({
    approved: 0, rejected: 0, pending_hod: 0, pending_admin: 0, total: 0
  });
  const [departments, setDepartments] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [topDeptUsers, setTopDeptUsers] = useState([]);
  const [topDeptAppraisals, setTopDeptAppraisals] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [groupedBar, setGroupedBar] = useState({ approved: [], rejected: [], pending: [] });
  const [timeframe, setTimeframe] = useState("week");
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const doughnutChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const topDeptUsersChartRef = useRef(null);
  const topDeptAppraisalsChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const groupedBarChartRef = useRef(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all users and count roles
      const users = await getAllUsers();
      const admins = users.filter(u => u.role === "admin").length;
      const hods = users.filter(u => u.role === "hod").length;
      const faculty = users.filter(u => u.role === "faculty").length;
      setUserStats({ admins, hods, faculty });

      // Dashboard stats
      const dashboard = await getAdminDashboardStats();
      setAppraisalStats({
        approved: dashboard.stats.approved,
        rejected: dashboard.stats.rejected,
        pending_hod: dashboard.stats.pendingHOD,
        pending_admin: dashboard.stats.pendingAdmin,
        total: dashboard.stats.totalAppraisals
      });

      // Departments
      const deptRes = await getDepartments();
      setDepartments(deptRes.departments || []);

      // Appraisals
      const appRes = await getAllAppraisalsForAdmin();
      setAppraisals(appRes || []);

      // Top departments by users
      const sortedDeptUsers = [...(deptRes.departments || [])]
        .sort((a, b) => b.stats.totalUsers - a.stats.totalUsers)
        .slice(0, 3);
      setTopDeptUsers(sortedDeptUsers);

      // Top departments by appraisals
      const deptAppraisalCounts = {};
      (appRes || []).forEach(a => {
        deptAppraisalCounts[a.department] = (deptAppraisalCounts[a.department] || 0) + 1;
      });
      const topDeptAppraisalsArr = Object.entries(deptAppraisalCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));
      setTopDeptAppraisals(topDeptAppraisalsArr);

      // Line chart: appraisals submitted over last 7 days
      const today = new Date();
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d;
      });
      const lineCounts = days.map(d => {
        const dayStr = d.toLocaleDateString();
        return appRes.filter(a =>
          new Date(a.submissionDate).toLocaleDateString() === dayStr
        ).length;
      });
      setLineData({ labels: days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' })), data: lineCounts });

      // Grouped bar: department-wise appraisal status
      const deptNames = deptRes.departments.map(d => d.name);
      const approved = deptNames.map(name =>
        appRes.filter(a => a.department === name && a.status === "approved").length
      );
      const rejected = deptNames.map(name =>
        appRes.filter(a => a.department === name && a.status === "rejected").length
      );
      const pending = deptNames.map(name =>
        appRes.filter(a => a.department === name && (a.status === "pending_hod" || a.status === "pending_admin")).length
      );
      setGroupedBar({ labels: deptNames, approved, rejected, pending });

    } catch (err) {
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Helper for trends
  const getSubmissionTrends = (data, timeframe) => {
    if (timeframe === "week") {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const trends = daysOfWeek.map(day => ({ day, count: 0 }));
      data.forEach(appraisal => {
        const submissionDate = new Date(appraisal.submissionDate);
        const dayOfWeek = submissionDate.getDay();
        trends[dayOfWeek].count++;
      });
      return {
        labels: daysOfWeek.map(d => d.slice(0, 3)),
        data: trends.map(t => t.count)
      };
    } else if (timeframe === "month") {
      // Last 30 days
      const trends = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        trends.push({
          day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: 0,
          fullDate: date.toDateString()
        });
      }
      data.forEach(appraisal => {
        const submissionDate = new Date(appraisal.submissionDate);
        const dateString = submissionDate.toDateString();
        const trendItem = trends.find(t => t.fullDate === dateString);
        if (trendItem) {
          trendItem.count++;
        }
      });
      return {
        labels: trends.map(t => t.day),
        data: trends.map(t => t.count)
      };
    } else if (timeframe === "year") {
      // Last 12 months
      const trends = [];
      const today = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        trends.push({
          day: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          count: 0,
          month: date.getMonth(),
          year: date.getFullYear()
        });
      }
      data.forEach(appraisal => {
        const submissionDate = new Date(appraisal.submissionDate);
        const trendItem = trends.find(t =>
          t.month === submissionDate.getMonth() &&
          t.year === submissionDate.getFullYear()
        );
        if (trendItem) {
          trendItem.count++;
        }
      });
      return {
        labels: trends.map(t => t.day),
        data: trends.map(t => t.count)
      };
    }
    return { labels: [], data: [] };
  };

  // Chart Data
  const doughnutData = {
    labels: ["Admins", "HODs", "Faculty"],
    datasets: [
      {
        data: [
          userStats.admins,
          userStats.hods,
          userStats.faculty
        ],
        backgroundColor: ["#ef4444", "#a21caf", "#2563eb"],
        borderColor: ["#dc2626", "#7c3aed", "#1d4ed8"],
        borderWidth: 2,
      },
    ],
  };

  const stackedBarData = {
    labels: ["Approved", "Rejected", "Pending HOD", "Pending Admin"],
    datasets: [
      {
        
        data: [
          appraisalStats.approved,
          appraisalStats.rejected,
          appraisalStats.pending_hod,
          appraisalStats.pending_admin
        ],
        backgroundColor: [
          "#10b981",
          "#ef4444",
          "#f59e0b",
          "#3b82f6"
        ],
        stack: "Status",
      },
    ],
  };

  const topDeptUsersData = {
    labels: topDeptUsers.map(d => d.name),
    datasets: [
      {
        label: "Users",
        data: topDeptUsers.map(d => d.stats.totalUsers),
        backgroundColor: topDeptUsers.map((_, i) => deptBarColors[i % deptBarColors.length]),
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  const topDeptAppraisalsData = {
    labels: topDeptAppraisals.map(d => d.name),
    datasets: [
      {
        label: "Appraisals",
        data: topDeptAppraisals.map(d => d.count),
        backgroundColor: topDeptAppraisals.map((_, i) => deptBarColors[i % deptBarColors.length]),
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  // Submission trends for selected timeframe
  const submissionTrends = getSubmissionTrends(appraisals, timeframe);

  const lineChartData = {
    labels: submissionTrends.labels,
    datasets: [
      {
        label: "Appraisals Submitted",
        data: submissionTrends.data,
        fill: false,
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: "#10b981",
      },
    ],
  };

  const groupedBarData = {
    labels: groupedBar.labels || [],
    datasets: [
      {
        label: "Approved",
        data: groupedBar.approved || [],
        backgroundColor: "#10b981",
      },
      {
        label: "Rejected",
        data: groupedBar.rejected || [],
        backgroundColor: "#ef4444",
      },
      {
        label: "Pending",
        data: groupedBar.pending || [],
        backgroundColor: "#f59e0b",
      },
    ],
  };

  // Summary cards data
  const summaryCards = [
    {
      label: "Admins",
      value: userStats.admins,
      icon: Users,
      color: "bg-red-500",
      textColor: "text-red-600"
    },
    {
      label: "HODs",
      value: userStats.hods,
      icon: Building2,
      color: "bg-purple-600",
      textColor: "text-purple-600"
    },
    {
      label: "Faculty",
      value: userStats.faculty,
      icon: Users,
      color: "bg-blue-600",
      textColor: "text-blue-600"
    },
    {
      label: "Appraisals",
      value: appraisalStats.total,
      icon: FileText,
      color: "bg-green-600",
      textColor: "text-green-600"
    },
    {
      label: "Approved",
      value: appraisalStats.approved,
      icon: CheckCircle,
      color: "bg-emerald-500",
      textColor: "text-emerald-600"
    },
    {
      label: "Rejected",
      value: appraisalStats.rejected,
      icon: XCircle,
      color: "bg-rose-500",
      textColor: "text-rose-600"
    },
    {
      label: "Pending HOD",
      value: appraisalStats.pending_hod,
      icon: Clock,
      color: "bg-amber-500",
      textColor: "text-amber-600"
    },
    {
      label: "Pending Admin",
      value: appraisalStats.pending_admin,
      icon: Activity,
      color: "bg-sky-500",
      textColor: "text-sky-600"
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownOpen && !event.target.closest('.export-dropdown-container')) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportDropdownOpen]);

  // Export to PDF logic (similar to HOD Reports)
  const exportToPDF = async () => {
    try {
      // Show loading toast
      const loadingToast = document.createElement('div');
      loadingToast.textContent = 'Generating PDF...';
      loadingToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#4f46e5;color:white;padding:12px 20px;border-radius:8px;z-index:1000;font-family:Arial,sans-serif;';
      document.body.appendChild(loadingToast);

      // Prepare HTML for PDF (no chart images, only details)
      const reportDate = new Date().toLocaleDateString();
      const reportTime = new Date().toLocaleTimeString();
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.5;">
          <div style="text-align: center; border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #16a34a; margin: 0; font-size: 28px;">Admin Analytics Report</h1>
            <p style="margin: 5px 0; font-weight: bold;">System-wide analytics for users, departments, and appraisals</p>
            <p style="margin: 5px 0; color: #666;">Generated on: ${reportDate} at ${reportTime}</p>
          </div>
          <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Summary</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Metric</th>
                <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="border:1px solid #e2e8f0;padding:8px;">Admins</td><td style="border:1px solid #e2e8f0;padding:8px;">${userStats.admins}</td></tr>
              <tr><td style="border:1px solid #e2e8f0;padding:8px;">HODs</td><td style="border:1px solid #e2e8f0;padding:8px;">${userStats.hods}</td></tr>
              <tr><td style="border:1px solid #e2e8f0;padding:8px;">Faculty</td><td style="border:1px solid #e2e8f0;padding:8px;">${userStats.faculty}</td></tr>
              <tr><td style="border:1px solid #e2e8f0;padding:8px;">Appraisals</td><td style="border:1px solid #e2e8f0;padding:8px;">${appraisalStats.total}</td></tr>
              <tr><td style="border:1px solid #e2e8f0;padding:8px;">Approved</td><td style="border:1px solid #e2e8f0;padding:8px;">${appraisalStats.approved}</td></tr>
              <tr><td style="border:1px solid #e2e8f0;padding:8px;">Rejected</td><td style="border:1px solid #e2e8f0;padding:8px;">${appraisalStats.rejected}</td></tr>
              <tr><td style="border:1px solid #e2e8f0;padding:8px;">Pending HOD</td><td style="border:1px solid #e2e8f0;padding:8px;">${appraisalStats.pending_hod}</td></tr>
              <tr><td style="border:1px solid #e2e8f0;padding:8px;">Pending Admin</td><td style="border:1px solid #e2e8f0;padding:8px;">${appraisalStats.pending_admin}</td></tr>
            </tbody>
          </table>
          <div style="page-break-before: always;"></div>
          <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">User Roles Distribution</h2>
          <div style="margin-bottom:20px;">
            <p>Admins: ${userStats.admins}</p>
            <p>HODs: ${userStats.hods}</p>
            <p>Faculty: ${userStats.faculty}</p>
            <p>This section shows the proportion of users by role in the system.</p>
          </div>
          <div style="page-break-before: always;"></div>
          <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Appraisal Status Overview</h2>
          <div style="margin-bottom:20px;">
            <p>Approved: ${appraisalStats.approved}</p>
            <p>Rejected: ${appraisalStats.rejected}</p>
            <p>Pending HOD: ${appraisalStats.pending_hod}</p>
            <p>Pending Admin: ${appraisalStats.pending_admin}</p>
            <p>This section shows the distribution of appraisal statuses across all submissions.</p>
          </div>
          <div style="page-break-before: always;"></div>
          <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Top Departments by Users</h2>
          <div style="margin-bottom:20px;">
            <table style="width:100%;margin-top:10px;border-collapse:collapse;">
              <thead>
                <tr style="background:#f1f5f9;">
                  <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Department</th>
                  <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Users</th>
                </tr>
              </thead>
              <tbody>
                ${topDeptUsers.map(d => `
                  <tr>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${d.name}</td>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${d.stats.totalUsers}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p>Departments with the highest number of users.</p>
          </div>
          <div style="page-break-before: always;"></div>
          <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Top Departments by Appraisals</h2>
          <div style="margin-bottom:20px;">
            <table style="width:100%;margin-top:10px;border-collapse:collapse;">
              <thead>
                <tr style="background:#f1f5f9;">
                  <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Department</th>
                  <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Appraisals</th>
                </tr>
              </thead>
              <tbody>
                ${topDeptAppraisals.map(d => `
                  <tr>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${d.name}</td>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${d.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p>Departments with the most appraisal submissions.</p>
          </div>
          <div style="page-break-before: always;"></div>
          <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Appraisals Submitted Over Time</h2>
          <div style="margin-bottom:20px;">
            <table style="width:100%;margin-top:10px;border-collapse:collapse;">
              <thead>
                <tr style="background:#f1f5f9;">
                  <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Period</th>
                  <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Submissions</th>
                </tr>
              </thead>
              <tbody>
                ${submissionTrends.labels.map((label, idx) => `
                  <tr>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${label}</td>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${submissionTrends.data[idx]}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p>Trend of appraisal submissions over the selected period (${timeframe}).</p>
          </div>
          <div style="page-break-before: always;"></div>
          <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Department-wise Appraisals (Grouped)</h2>
          <div style="margin-bottom:20px;">
            <table style="width:100%;margin-top:10px;border-collapse:collapse;">
              <thead>
                <tr style="background:#f1f5f9;">
                  <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Department</th>
                  <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Approved</th>
                  <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Rejected</th>
                  <th style="border:1px solid #e2e8f0;padding:8px;text-align:left;">Pending</th>
                </tr>
              </thead>
              <tbody>
                ${(groupedBar.labels || []).map((dept, idx) => `
                  <tr>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${dept}</td>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${groupedBar.approved[idx]}</td>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${groupedBar.rejected[idx]}</td>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${groupedBar.pending[idx]}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p>Shows approved, rejected, and pending appraisals by department.</p>
          </div>
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 12px;">
            <p>This report was automatically generated by the Faculty Appraisal System</p>
            <p>Generated on: ${reportDate} at ${reportTime}</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 1,
        filename: `Admin_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, allowTaint: false, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(loadingToast);

      // Success toast
      const successToast = document.createElement('div');
      successToast.textContent = 'PDF generated successfully!';
      successToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#22c55e;color:white;padding:12px 20px;border-radius:8px;z-index:1000;font-family:Arial,sans-serif;';
      document.body.appendChild(successToast);
      setTimeout(() => {
        if (document.body.contains(successToast)) document.body.removeChild(successToast);
      }, 3000);

    } catch (error) {
      // Error handling
      const loadingToast = document.querySelector('div[style*="Generating PDF"]');
      if (loadingToast) document.body.removeChild(loadingToast);
      const errorToast = document.createElement('div');
      errorToast.textContent = 'Error generating PDF. Please try again.';
      errorToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:12px 20px;border-radius:8px;z-index:1000;font-family:Arial,sans-serif;';
      document.body.appendChild(errorToast);
      setTimeout(() => {
        if (document.body.contains(errorToast)) document.body.removeChild(errorToast);
      }, 3000);
    }
  };

  // Export to Excel (CSV)
  const exportToCSV = () => {
    try {
      const csvData = [];
      csvData.push(['Admin Analytics Report']);
      csvData.push(['Generated on', new Date().toLocaleString()]);
      csvData.push(['']);
      csvData.push(['Summary']);
      csvData.push(['Metric', 'Value']);
      csvData.push(['Admins', userStats.admins]);
      csvData.push(['HODs', userStats.hods]);
      csvData.push(['Faculty', userStats.faculty]);
      csvData.push(['Appraisals', appraisalStats.total]);
      csvData.push(['Approved', appraisalStats.approved]);
      csvData.push(['Rejected', appraisalStats.rejected]);
      csvData.push(['Pending HOD', appraisalStats.pending_hod]);
      csvData.push(['Pending Admin', appraisalStats.pending_admin]);
      csvData.push(['']);

      csvData.push(['User Roles Distribution']);
      csvData.push(['Admins', userStats.admins]);
      csvData.push(['HODs', userStats.hods]);
      csvData.push(['Faculty', userStats.faculty]);
      csvData.push(['']);

      csvData.push(['Appraisal Status Overview']);
      csvData.push(['Approved', appraisalStats.approved]);
      csvData.push(['Rejected', appraisalStats.rejected]);
      csvData.push(['Pending HOD', appraisalStats.pending_hod]);
      csvData.push(['Pending Admin', appraisalStats.pending_admin]);
      csvData.push(['']);

      csvData.push(['Top Departments by Users']);
      csvData.push(['Department', 'Users']);
      topDeptUsers.forEach(d => csvData.push([d.name, d.stats.totalUsers]));
      csvData.push(['']);

      csvData.push(['Top Departments by Appraisals']);
      csvData.push(['Department', 'Appraisals']);
      topDeptAppraisals.forEach(d => csvData.push([d.name, d.count]));
      csvData.push(['']);

      csvData.push([`Appraisals Submitted Over Time (${timeframe})`]);
      csvData.push(['Label', 'Submissions']);
      submissionTrends.labels.forEach((label, idx) => {
        csvData.push([label, submissionTrends.data[idx]]);
      });
      csvData.push(['']);

      csvData.push(['Department-wise Appraisals (Grouped)']);
      csvData.push(['Department', 'Approved', 'Rejected', 'Pending']);
      (groupedBar.labels || []).forEach((dept, idx) => {
        csvData.push([
          dept,
          groupedBar.approved[idx],
          groupedBar.rejected[idx],
          groupedBar.pending[idx]
        ]);
      });

      // Convert to CSV
      const csvContent = csvData.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Admin_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error generating CSV report. Please try again.');
    }
  };

  return (
    <DashboardLayout allowedRole="admin">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Export Dropdown Button */}
        <div className="flex justify-end mb-4 export-dropdown-container">
          <Button
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            variant="secondary"
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Analytics</span>
            <span className="sm:hidden">Export</span>
          </Button>
          {exportDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
              <div className="py-2">
                <button
                  onClick={() => { exportToPDF(); setExportDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                >
                  <FileDown className="w-4 h-4 mr-3 text-red-500" />
                  <span className="font-medium">Export as PDF</span>
                </button>
                <button
                  onClick={() => { exportToCSV(); setExportDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                >
                  <Table className="w-4 h-4 mr-3 text-green-500" />
                  <span className="font-medium">Export as Excel</span>
                </button>
              </div>
              <div className="border-t border-gray-200 sm:hidden">
                <button
                  onClick={() => setExportDropdownOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Close
                </button>
              </div>
            </div>
          )}
          {exportDropdownOpen && (
            <div
              className="fixed inset-0 z-40 sm:hidden"
              onClick={() => setExportDropdownOpen(false)}
            />
          )}
        </div>
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-2xl shadow-lg px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10 pointer-events-none rounded-2xl" />
            <div className="relative flex items-center">
              <PieChart className="w-10 h-10 text-white mr-4" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center">
                  Admin Analytics Dashboard
                </h1>
                <p className="text-white text-sm sm:text-base opacity-80">
                  Insights and analytics for users, departments, and appraisals
                </p>
              </div>
            </div>
            <div className="relative mt-6 sm:mt-0 sm:ml-auto text-right">
              <div className="text-white text-xs sm:text-sm font-medium mb-1">Total Appraisals</div>
              <div className="text-2xl sm:text-3xl font-bold text-white">{appraisalStats.total}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-300 mr-2" />
                <span className="text-green-100 text-xs">Success Rate: {appraisalStats.total ? Math.round((appraisalStats.approved / appraisalStats.total) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-8">
          {summaryCards.map(card => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col items-center hover:shadow-lg transition-all duration-200">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-2`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`text-xs font-medium mb-1 ${card.textColor}`}>{card.label}</div>
              <div className={`text-xl font-bold ${card.textColor}`}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <BarChart3 className="w-12 h-12 animate-spin text-green-500 mb-4" />
            <div className="text-lg font-medium">Loading analytics...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* User Roles Distribution Card */}
            <Card
              title="User Roles Distribution"
              icon={Users}
              color="bg-blue-600"
              details={
                <>
                  <div>
                    <span className="font-semibold">Admins:</span> {userStats.admins} &nbsp;|&nbsp;
                    <span className="font-semibold">HODs:</span> {userStats.hods} &nbsp;|&nbsp;
                    <span className="font-semibold">Faculty:</span> {userStats.faculty}
                  </div>
                  <div className="mt-1 text-gray-500">
                    Shows the proportion of users by role in the system.
                  </div>
                </>
              }
            >
              <div className="flex flex-col items-center justify-center gap-6 w-full">
                <div className="flex justify-center items-center min-h-[220px] sm:min-h-[260px]">
                  <div className="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px]">
                    <Doughnut data={doughnutData} options={chartOptions} />
                  </div>
                </div>
                {/* Legend at bottom - User Roles Distribution */}
                <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 justify-center">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#ef4444" }}></span>
                    <span className="font-semibold text-red-600 text-sm">Admins</span>
                    <span className="ml-2 text-xs text-gray-700">{userStats.admins}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#a21caf" }}></span>
                    <span className="font-semibold text-purple-600 text-sm">HODs</span>
                    <span className="ml-2 text-xs text-gray-700">{userStats.hods}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#2563eb" }}></span>
                    <span className="font-semibold text-blue-600 text-sm">Faculty</span>
                    <span className="ml-2 text-xs text-gray-700">{userStats.faculty}</span>
                  </div>
                </div>
              </div>
            </Card>
            {/* Appraisal Status Overview */}
            <Card
              title="Appraisal Status Overview"
              icon={BarChart3}
              color="bg-green-600"
              details={
                <>
                  <div>
                    <span className="font-semibold">Approved:</span> {appraisalStats.approved} &nbsp;|&nbsp;
                    <span className="font-semibold">Rejected:</span> {appraisalStats.rejected} &nbsp;|&nbsp;
                    <span className="font-semibold">Pending HOD:</span> {appraisalStats.pending_hod} &nbsp;|&nbsp;
                    <span className="font-semibold">Pending Admin:</span> {appraisalStats.pending_admin}
                  </div>
                  <div className="mt-1 text-gray-500">
                    Distribution of appraisal statuses across all submissions.
                  </div>
                </>
              }
            >
              <div className="min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-center">
                  <div className="w-full max-w-[320px] h-[180px] sm:h-[260px] md:h-[320px]">
                    <Bar data={stackedBarData} options={stackedBarOptions} />
                  </div>
                </div>
                {/* Legend for appraisal status colors */}
                <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 justify-center">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#10b981" }}></span>
                    <span className="font-semibold text-emerald-600 text-sm">Approved</span>
                    <span className="ml-2 text-xs text-gray-700">{appraisalStats.approved}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#ef4444" }}></span>
                    <span className="font-semibold text-rose-600 text-sm">Rejected</span>
                    <span className="ml-2 text-xs text-gray-700">{appraisalStats.rejected}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#f59e0b" }}></span>
                    <span className="font-semibold text-amber-600 text-sm">Pending HOD</span>
                    <span className="ml-2 text-xs text-gray-700">{appraisalStats.pending_hod}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#3b82f6" }}></span>
                    <span className="font-semibold text-sky-600 text-sm">Pending Admin</span>
                    <span className="ml-2 text-xs text-gray-700">{appraisalStats.pending_admin}</span>
                  </div>
                </div>
              </div>
            </Card>
            {/* Top Departments by Users */}
            <Card
              title="Top Departments by Users"
              icon={Building2}
              color="bg-purple-600"
              details={
                <>
                  <div>
                    {topDeptUsers.map(d => (
                      <div key={d.name}>
                        <span className="font-semibold">{d.name}:</span> {d.stats.totalUsers} users
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 text-gray-500">
                    Departments with the highest number of users.
                  </div>
                </>
              }
            >
              <div className="min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-center">
                  <div className="w-full max-w-[320px] h-[180px] sm:h-[260px] md:h-[320px]">
                    <Bar data={topDeptUsersData} options={horizontalBarOptions} />
                  </div>
                </div>
                {/* Legend for department colors - Top Departments by Users */}
                <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 justify-center">
                  {topDeptUsers.map((dept, i) => (
                    <div key={dept.name} className="flex items-center gap-2 min-w-[120px]">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ background: deptBarColors[i % deptBarColors.length] }}
                      ></span>
                      <span className="font-semibold text-gray-700 text-sm">{dept.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            {/* Top Departments by Appraisals */}
            <Card
              title="Top Departments by Appraisals"
              icon={FileText}
              color="bg-blue-600"
              details={
                <>
                  <div>
                    {topDeptAppraisals.map(d => (
                      <div key={d.name}>
                        <span className="font-semibold">{d.name}:</span> {d.count} appraisals
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 text-gray-500">
                    Departments with the most appraisal submissions.
                  </div>
                </>
              }
            >
              <div className="min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-center">
                  <div className="w-full max-w-[320px] h-[180px] sm:h-[260px] md:h-[320px]">
                    <Bar data={topDeptAppraisalsData} options={horizontalBarOptions} />
                  </div>
                </div>
                {/* Legend for department colors - Top Departments by Appraisals */}
                <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 justify-center">
                  {topDeptAppraisals.map((dept, i) => (
                    <div key={dept.name} className="flex items-center gap-2 min-w-[120px]">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ background: deptBarColors[i % deptBarColors.length] }}
                      ></span>
                      <span className="font-semibold text-gray-700 text-sm">{dept.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            {/* Appraisals Submitted Over Time (Week/Month/Year) */}
            <Card
              title="Appraisals Submitted Over Time"
              icon={LineChart}
              color="bg-emerald-500"
              details={
                <>
                  <div>
                    <span className="font-semibold">
                      {timeframe === "week" ? "This Week" : timeframe === "month" ? "Last 30 Days" : "Last 12 Months"}
                    </span>
                    : {submissionTrends.data.reduce((a, b) => a + b, 0) || 0} submissions
                  </div>
                  <div className="mt-1 text-gray-500">
                    Trend of appraisal submissions over the selected period.
                  </div>
                </>
              }
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row items-center justify-end mb-2 gap-2">
                  <label className="text-xs text-gray-500">Filter:</label>
                  <select
                    value={timeframe}
                    onChange={e => setTimeframe(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="week">This Week</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last 12 Months</option>
                  </select>
                </div>
                <div className="w-full flex items-center justify-center">
                  <div className="w-full max-w-[320px] h-[180px] sm:h-[260px] md:h-[320px]">
                    <Line data={lineChartData} options={lineOptions} />
                  </div>
                </div>
                {/* Legend for line color - Appraisals Submitted Over Time */}
                <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 justify-center">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#10b981" }}></span>
                    <span className="font-semibold text-emerald-600 text-sm">Appraisals Submitted</span>
                  </div>
                </div>
              </div>
            </Card>
            {/* Department-wise Appraisals (Grouped) */}
            <Card
              title="Department-wise Appraisals (Grouped)"
              icon={BarChart3}
              color="bg-amber-500"
              details={
                <>
                  <div>
                    <span className="font-semibold">Departments:</span> {groupedBar.labels?.length || 0}
                  </div>
                  <div className="mt-1 text-gray-500">
                    Shows approved, rejected, and pending appraisals by department.
                  </div>
                </>
              }
            >
              <div className="min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-center">
                  <div className="w-full max-w-[320px] h-[180px] sm:h-[260px] md:h-[320px]">
                    <Bar data={groupedBarData} options={groupedBarOptions} />
                  </div>
                </div>
                {/* Legend for grouped bar colors - Department-wise Appraisals (Grouped) */}
                <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 justify-center">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#10b981" }}></span>
                    <span className="font-semibold text-emerald-600 text-sm">Approved</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#ef4444" }}></span>
                    <span className="font-semibold text-rose-600 text-sm">Rejected</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-4 h-4 rounded-full" style={{ background: "#f59e0b" }}></span>
                    <span className="font-semibold text-amber-600 text-sm">Pending</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Pending Appraisals - Action Required */}
        <div className="mt-12">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              Pending Appraisals - Action Required
            </h2>
            <p className="text-gray-700 mb-4 text-sm">
              Total pending appraisals requiring admin review: <span className="font-bold text-red-700">{appraisals.filter(a => a.status === "pending_admin").length}</span>
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-red-50">
                    <th className="px-4 py-2 text-left font-semibold text-red-700 whitespace-nowrap">Faculty Name</th>
                    <th className="px-4 py-2 text-left font-semibold text-red-700 whitespace-nowrap">Department</th>
                    <th className="px-4 py-2 text-left font-semibold text-red-700 whitespace-nowrap">Submission Date</th>
                    <th className="px-4 py-2 text-center font-semibold text-red-700 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appraisals.filter(a => a.status === "pending_admin").length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No pending appraisals.</td>
                    </tr>
                  ) : (
                    appraisals
                      .filter(a => a.status === "pending_admin")
                      .map(a => (
                        <tr key={a._id} className="hover:bg-red-50 transition group">
                          <td className="px-4 py-2 text-gray-900 font-medium whitespace-nowrap">{a.fullName}</td>
                          <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{a.department}</td>
                          <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{new Date(a.submissionDate).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-center whitespace-nowrap">
                            <button
                              onClick={() => window.location.href = `/admin/appraisal/${a._id}`}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                              aria-label={`Review appraisal for ${a.fullName}`}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Responsive hint for mobile */}
            <div className="mt-2 text-xs text-gray-400 sm:hidden text-center">
              Swipe left/right to see all columns.
            </div>
          </div>
        </div>
        {/* Hidden charts for export (not visible, just for refs if needed) */}
        <div style={{ display: "none" }}>
          <Doughnut ref={doughnutChartRef} data={doughnutData} options={chartOptions} />
          <Bar ref={statusChartRef} data={stackedBarData} options={stackedBarOptions} />
          <Bar ref={topDeptUsersChartRef} data={topDeptUsersData} options={horizontalBarOptions} />
          <Bar ref={topDeptAppraisalsChartRef} data={topDeptAppraisalsData} options={horizontalBarOptions} />
          <Line ref={lineChartRef} data={lineChartData} options={lineOptions} />
          <Bar ref={groupedBarChartRef} data={groupedBarData} options={groupedBarOptions} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsDashboard;