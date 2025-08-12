import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Eye, Calendar, User, Building2, Clock } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getHODAppraisals } from "../../utils/api";
import { showSuccessToast } from "../../utils/toast";

const ViewAppraisals = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchAppraisals();

    // Show success message if coming from review page
    if (location.state?.message) {
      showSuccessToast(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  if (loading) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">Loading department appraisals...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="hod">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">Department Appraisals</h1>
              <p className="text-gray-600 mt-1">Review and manage faculty appraisals in your department</p>
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

          {appraisals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appraisals found</h3>
              <p className="text-gray-500">No faculty members in your department have submitted appraisals yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appraisals.map((appraisal) => (
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
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
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <Button
                        onClick={() => navigate(`/hod/appraisal/${appraisal._id}`)}
                        className="w-full lg:w-auto"
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
