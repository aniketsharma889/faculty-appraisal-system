import { Clock, Search, CheckCircle, XCircle, FileText } from "lucide-react";

const DashboardStats = ({ stats }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_hod':
        return <Clock className="w-5 h-5" />;
      case 'pending_admin':
        return <Search className="w-5 h-5" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_hod':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'pending_admin':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Appraisals</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {stats.statusBreakdown.map((status) => (
        <div key={status.status} className={`rounded-lg shadow-sm border p-6 ${getStatusColor(status.status)}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                {getStatusIcon(status.status)}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">
                {status.status === 'pending_hod' ? 'Pending HOD' :
                 status.status === 'pending_admin' ? 'Pending Admin' :
                 status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </p>
              <p className="text-2xl font-bold">{status.count}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
