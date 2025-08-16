import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Filter,
  FileDown,
  Table
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import html2pdf from 'html2pdf.js';
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getHODAppraisals, getDepartmentFaculty } from "../../utils/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [appraisals, setAppraisals] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [stats, setStats] = useState({
    totalAppraisals: 0,
    pendingHOD: 0,
    pendingAdmin: 0,
    approved: 0,
    rejected: 0
  });
  const [pendingAppraisals, setPendingAppraisals] = useState([]);
  const [submissionTrends, setSubmissionTrends] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    fetchReportsData();
  }, []);

  useEffect(() => {
    if (appraisals.length > 0) {
      const trends = processSubmissionTrends(appraisals, selectedTimeframe);
      setSubmissionTrends(trends);
    }
  }, [selectedTimeframe, appraisals]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [appraisalsData, facultyData] = await Promise.all([
        getHODAppraisals(),
        getDepartmentFaculty()
      ]);
      
      setAppraisals(appraisalsData);
      setFaculty(facultyData);
      
      // Calculate statistics
      const statistics = {
        totalAppraisals: appraisalsData.length,
        pendingHOD: appraisalsData.filter(a => a.status === 'pending_hod').length,
        pendingAdmin: appraisalsData.filter(a => a.status === 'pending_admin').length,
        approved: appraisalsData.filter(a => a.status === 'approved').length,
        rejected: appraisalsData.filter(a => a.status === 'rejected').length
      };
      setStats(statistics);
      
      // Process pending appraisals with days since submission
      const pending = appraisalsData
        .filter(a => a.status === 'pending_hod')
        .map(appraisal => {
          const daysSince = Math.floor(
            (new Date() - new Date(appraisal.submissionDate)) / (1000 * 60 * 60 * 24)
          );
          return {
            ...appraisal,
            daysSinceSubmission: daysSince
          };
        })
        .sort((a, b) => b.daysSinceSubmission - a.daysSinceSubmission);
      
      setPendingAppraisals(pending);
      
      // Process submission trends by day of week
      const trends = processSubmissionTrends(appraisalsData, selectedTimeframe);
      setSubmissionTrends(trends);
      
    } catch (err) {
      setError(err.message || "Failed to fetch reports data");
    } finally {
      setLoading(false);
    }
  };

  const processSubmissionTrends = (data, timeframe) => {
    if (timeframe === 'week') {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const trends = daysOfWeek.map(day => ({ day, count: 0 }));
      
      data.forEach(appraisal => {
        const submissionDate = new Date(appraisal.submissionDate);
        const dayOfWeek = submissionDate.getDay();
        trends[dayOfWeek].count++;
      });
      
      return trends;
    } else if (timeframe === 'month') {
      // Get last 30 days
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
      
      return trends;
    } else if (timeframe === 'year') {
      // Get last 12 months
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
      
      return trends;
    }
    
    return [];
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportsData();
    setTimeout(() => setRefreshing(false), 600);
  };

  const exportToPDF = async () => {
    try {
      // Show loading state
      const loadingToast = document.createElement('div');
      loadingToast.textContent = 'Generating PDF...';
      loadingToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#4f46e5;color:white;padding:12px 20px;border-radius:8px;z-index:1000;font-family:Arial,sans-serif;';
      document.body.appendChild(loadingToast);

      // Create HTML content for PDF
      const reportDate = new Date().toLocaleDateString();
      const reportTime = new Date().toLocaleTimeString();
      
      // Create a container element
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.5;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #16a34a; margin: 0; font-size: 28px;">Department Reports</h1>
            <p style="margin: 5px 0; font-weight: bold;">Analytics and Insights for Department Appraisal Submissions</p>
            <p style="margin: 5px 0; color: #666;">Generated on: ${reportDate} at ${reportTime}</p>
          </div>

          <!-- Overview Statistics -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Overview Statistics</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${stats.totalAppraisals}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Total Appraisals</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${stats.pendingHOD}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Pending Review</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${stats.approved}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Approved</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${faculty.length}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Faculty Count</div>
              </div>
            </div>
          </div>

          <!-- Status Distribution -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Status Distribution</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Status</th>
                  <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Count</th>
                  <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">Pending HOD Review</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">${stats.pendingHOD}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">${stats.totalAppraisals > 0 ? ((stats.pendingHOD / stats.totalAppraisals) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">Pending Admin Review</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">${stats.pendingAdmin}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">${stats.totalAppraisals > 0 ? ((stats.pendingAdmin / stats.totalAppraisals) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">Approved</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">${stats.approved}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">${stats.totalAppraisals > 0 ? ((stats.approved / stats.totalAppraisals) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">Rejected</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">${stats.rejected}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px;">${stats.totalAppraisals > 0 ? ((stats.rejected / stats.totalAppraisals) * 100).toFixed(1) : 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${pendingAppraisals.length > 0 ? `
          <!-- Pending Appraisals -->
          <div style="margin-bottom: 30px; page-break-before: auto;">
            <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Pending Appraisals - Action Required</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Faculty Name</th>
                  <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Employee Code</th>
                  <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Submission Date</th>
                  <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Days Pending</th>
                  <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Priority</th>
                </tr>
              </thead>
              <tbody>
                ${pendingAppraisals.map(appraisal => `
                  <tr>
                    <td style="border: 1px solid #e2e8f0; padding: 12px;">${appraisal.fullName}</td>
                    <td style="border: 1px solid #e2e8f0; padding: 12px;">${appraisal.employeeCode}</td>
                    <td style="border: 1px solid #e2e8f0; padding: 12px;">${new Date(appraisal.submissionDate).toLocaleDateString()}</td>
                    <td style="border: 1px solid #e2e8f0; padding: 12px;">${appraisal.daysSinceSubmission} ${appraisal.daysSinceSubmission === 1 ? 'day' : 'days'}</td>
                    <td style="border: 1px solid #e2e8f0; padding: 12px; color: ${appraisal.daysSinceSubmission >= 7 ? '#dc2626' : appraisal.daysSinceSubmission >= 3 ? '#d97706' : '#059669'}; font-weight: ${appraisal.daysSinceSubmission >= 7 ? 'bold' : 'normal'};">
                      ${appraisal.daysSinceSubmission >= 7 ? 'High' : appraisal.daysSinceSubmission >= 3 ? 'Medium' : 'Normal'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <!-- Submission Trends -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #22c55e; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Submission Trends (${
              selectedTimeframe === 'week' ? 'By Day of Week' :
              selectedTimeframe === 'month' ? 'Last 30 Days' :
              'Last 12 Months'
            })</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">${selectedTimeframe === 'week' ? 'Day' : selectedTimeframe === 'month' ? 'Date' : 'Month'}</th>
                  <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Submissions</th>
                </tr>
              </thead>
              <tbody>
                ${submissionTrends.map(trend => `
                  <tr>
                    <td style="border: 1px solid #e2e8f0; padding: 12px;">${trend.day}</td>
                    <td style="border: 1px solid #e2e8f0; padding: 12px;">${trend.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 12px;">
            <p>This report was automatically generated by the Faculty Appraisal System</p>
            <p>Generated on: ${reportDate} at ${reportTime}</p>
          </div>
        </div>
      `;

      // Configure PDF options
      const opt = {
        margin: 1,
        filename: `Department_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: false,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        }
      };

      // Generate and save PDF
      await html2pdf().set(opt).from(element).save();

      // Remove loading toast
      document.body.removeChild(loadingToast);

      // Show success message
      const successToast = document.createElement('div');
      successToast.textContent = 'PDF generated successfully!';
      successToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#22c55e;color:white;padding:12px 20px;border-radius:8px;z-index:1000;font-family:Arial,sans-serif;';
      document.body.appendChild(successToast);
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Remove loading toast if it exists
      const loadingToast = document.querySelector('div[style*="Generating PDF"]');
      if (loadingToast) {
        document.body.removeChild(loadingToast);
      }
      
      // Show error message
      const errorToast = document.createElement('div');
      errorToast.textContent = 'Error generating PDF. Please try again.';
      errorToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:12px 20px;border-radius:8px;z-index:1000;font-family:Arial,sans-serif;';
      document.body.appendChild(errorToast);
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    }
  };

  const exportToCSV = () => {
    try {
      const csvData = [];
      
      // Add header info
      csvData.push(['Department Reports']);
      csvData.push(['Generated on', new Date().toLocaleString()]);
      csvData.push(['']);
      
      // Add overview statistics
      csvData.push(['Overview Statistics']);
      csvData.push(['Metric', 'Value']);
      csvData.push(['Total Appraisals', stats.totalAppraisals]);
      csvData.push(['Pending HOD Review', stats.pendingHOD]);
      csvData.push(['Pending Admin Review', stats.pendingAdmin]);
      csvData.push(['Approved', stats.approved]);
      csvData.push(['Rejected', stats.rejected]);
      csvData.push(['Faculty Count', faculty.length]);
      csvData.push(['']);
      
      // Add status distribution
      csvData.push(['Status Distribution']);
      csvData.push(['Status', 'Count', 'Percentage']);
      csvData.push(['Pending HOD Review', stats.pendingHOD, `${stats.totalAppraisals > 0 ? ((stats.pendingHOD / stats.totalAppraisals) * 100).toFixed(1) : 0}%`]);
      csvData.push(['Pending Admin Review', stats.pendingAdmin, `${stats.totalAppraisals > 0 ? ((stats.pendingAdmin / stats.totalAppraisals) * 100).toFixed(1) : 0}%`]);
      csvData.push(['Approved', stats.approved, `${stats.totalAppraisals > 0 ? ((stats.approved / stats.totalAppraisals) * 100).toFixed(1) : 0}%`]);
      csvData.push(['Rejected', stats.rejected, `${stats.totalAppraisals > 0 ? ((stats.rejected / stats.totalAppraisals) * 100).toFixed(1) : 0}%`]);
      csvData.push(['']);
      
      // Add pending appraisals if any
      if (pendingAppraisals.length > 0) {
        csvData.push(['Pending Appraisals - Action Required']);
        csvData.push(['Faculty Name', 'Employee Code', 'Submission Date', 'Days Pending', 'Priority']);
        pendingAppraisals.forEach(appraisal => {
          csvData.push([
            appraisal.fullName,
            appraisal.employeeCode,
            new Date(appraisal.submissionDate).toLocaleDateString(),
            `${appraisal.daysSinceSubmission} ${appraisal.daysSinceSubmission === 1 ? 'day' : 'days'}`,
            appraisal.daysSinceSubmission >= 7 ? 'High' : appraisal.daysSinceSubmission >= 3 ? 'Medium' : 'Normal'
          ]);
        });
        csvData.push(['']);
      }
      
      // Add submission trends
      csvData.push([`Submission Trends (${
        selectedTimeframe === 'week' ? 'By Day of Week' :
        selectedTimeframe === 'month' ? 'Last 30 Days' :
        'Last 12 Months'
      })`]);
      csvData.push([
        selectedTimeframe === 'week' ? 'Day' : selectedTimeframe === 'month' ? 'Date' : 'Month',
        'Submissions'
      ]);
      submissionTrends.forEach(trend => {
        csvData.push([trend.day, trend.count]);
      });
      
      // Convert to CSV format
      const csvContent = csvData.map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Department_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV report. Please try again.');
    }
  };

  // Chart configurations
  const statusChartData = {
    labels: ['Pending HOD Review', 'Pending Admin Review', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [stats.pendingHOD, stats.pendingAdmin, stats.approved, stats.rejected],
        backgroundColor: [
          '#f59e0b', // amber
          '#3b82f6', // blue
          '#10b981', // emerald
          '#ef4444'  // red
        ],
        borderColor: [
          '#d97706',
          '#2563eb',
          '#059669',
          '#dc2626'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  const trendsChartData = {
    labels: submissionTrends.map(trend => trend.day),
    datasets: [
      {
        label: 'Submissions',
        data: submissionTrends.map(trend => trend.count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  const trendsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: selectedTimeframe === 'month' ? 45 : 0,
          minRotation: selectedTimeframe === 'month' ? 45 : 0
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return `${context[0].label}`;
          },
          label: function(context) {
            return `Submissions: ${context.parsed.y}`;
          }
        }
      }
    }
  };

  const getPriorityColor = (days) => {
    if (days >= 7) return "text-red-600 bg-red-50 border-red-200";
    if (days >= 3) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getPriorityIcon = (days) => {
    if (days >= 7) return <AlertCircle className="w-4 h-4" />;
    if (days >= 3) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reports data...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="hod">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-8 h-8 mr-3 text-green-600" />
                  Department Reports
                </h1>
                <p className="text-gray-600 mt-2">
                  Analytics and insights for department appraisal submissions
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                {/* Export Dropdown */}
                <div className="relative group">
                  <Button
                    variant="secondary"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={exportToPDF}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FileDown className="w-4 h-4 mr-3" />
                        Export as PDF
                      </button>
                      <button
                        onClick={exportToCSV}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Table className="w-4 h-4 mr-3" />
                        Export as CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Appraisals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAppraisals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Review</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingHOD}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Faculty Count</p>
                  <p className="text-2xl font-bold text-purple-600">{faculty.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Status Distribution Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Appraisal Status Distribution</h3>
                <div className="text-sm text-gray-500">
                  Total: {stats.totalAppraisals} submissions
                </div>
              </div>
              
              {stats.totalAppraisals > 0 ? (
                <div className="h-80">
                  <Doughnut data={statusChartData} options={statusChartOptions} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No appraisal data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Submission Trends Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="block sm:flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Submission Trends - {
                    selectedTimeframe === 'week' ? 'By Day of Week' :
                    selectedTimeframe === 'month' ? 'Last 30 Days' :
                    'Last 12 Months'
                  }
                </h3>
                <div className="flex items-center space-x-2">
  <Filter className="w-4 h-4 text-gray-400"/>
  <select
    value={selectedTimeframe}
    onChange={(e) => setSelectedTimeframe(e.target.value)}
    className="text-sm sm:text-sm xs:text-xs border border-gray-300 rounded-lg px-3 py-1 sm:px-3 sm:py-1 xs:px-2 xs:py-0.5 focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="week">This Week</option>
    <option value="month">Last 30 Days</option>
    <option value="year">Last 12 Months</option>
  </select>
</div>

              </div>
              
              <div className="h-80">
                <Bar data={trendsChartData} options={trendsChartOptions} />
              </div>
              
              {submissionTrends.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No submission data for selected timeframe</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pending Appraisals Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="block sm:flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Pending Appraisals - Action Required</h3>
              <div className="text-sm text-gray-500">
                {pendingAppraisals.length} pending reviews
              </div>
            </div>

            {pendingAppraisals.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h4>
                <p className="text-gray-500">No pending appraisals require your review</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Faculty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submission Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days Pending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingAppraisals.map((appraisal) => (
                      <tr key={appraisal._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-medium text-sm">
                                {appraisal.fullName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {appraisal.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appraisal.employeeCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(appraisal.submissionDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appraisal.daysSinceSubmission} {appraisal.daysSinceSubmission === 1 ? 'day' : 'days'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(appraisal.daysSinceSubmission)}`}>
                            {getPriorityIcon(appraisal.daysSinceSubmission)}
                            <span className="ml-1">
                              {appraisal.daysSinceSubmission >= 7 ? 'High' : 
                               appraisal.daysSinceSubmission >= 3 ? 'Medium' : 'Normal'}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            onClick={() => window.open(`/hod/appraisal/${appraisal._id}`, '_blank')}
                            size="small"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Review
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
      </div>
    </DashboardLayout>
  );
};

export default Reports;
                 