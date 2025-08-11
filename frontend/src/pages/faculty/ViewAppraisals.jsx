import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getMyAppraisals } from "../../utils/api";

const ViewAppraisals = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const data = await getMyAppraisals();
      setAppraisals(data);
    } catch (err) {
      setError(err.message || "Failed to fetch appraisals");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_hod':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_admin':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'pending_hod':
        return 'Pending HOD Review';
      case 'pending_admin':
        return 'Pending Admin Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const canEdit = (status) => {
    return status === 'pending_hod' || status === 'rejected';
  };

  if (loading) {
    return (
      <DashboardLayout allowedRole="faculty">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">Loading appraisals...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="faculty">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-0">My Appraisals</h1>
            <Link to="/faculty/submit-appraisal">
              <Button className="w-full sm:w-auto text-sm sm:text-base">Submit New Appraisal</Button>
            </Link>
          </div>

          {location.state?.message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6">
              <span className="text-sm sm:text-base">{location.state.message}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6">
              <span className="text-sm sm:text-base">{error}</span>
            </div>
          )}

          {appraisals.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 mb-2">No appraisals found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">You haven't submitted any appraisals yet.</p>
              <Link to="/faculty/submit-appraisal">
                <Button className="text-sm sm:text-base">Submit Your First Appraisal</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {appraisals.map((appraisal) => (
                <div key={appraisal._id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">{appraisal.fullName}</h3>
                      <p className="text-sm sm:text-base text-gray-600">{appraisal.department} - {appraisal.designation}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Employee Code: {appraisal.employeeCode}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-3 lg:mt-0">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(appraisal.status)}`}>
                        {formatStatus(appraisal.status)}
                      </span>
                      {canEdit(appraisal.status) && (
                        <Link to={`/faculty/edit-appraisal/${appraisal._id}`}>
                          <Button variant="secondary" size="small" className="w-full sm:w-auto text-xs sm:text-sm">
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Submitted:</span>
                      <p className="text-gray-600">{new Date(appraisal.submissionDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Research Publications:</span>
                      <p className="text-gray-600">{appraisal.researchPublications?.length || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Projects:</span>
                      <p className="text-gray-600">{appraisal.projects?.length || 0}</p>
                    </div>
                  </div>

                  {appraisal.hodApproval?.remarks && (
                    <div className="mt-3 sm:mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h4 className="font-medium text-yellow-800 text-sm sm:text-base">HOD Remarks:</h4>
                      <p className="text-yellow-700 text-xs sm:text-sm">{appraisal.hodApproval.remarks}</p>
                    </div>
                  )}

                  {appraisal.adminApproval?.remarks && (
                    <div className="mt-3 sm:mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-medium text-blue-800 text-sm sm:text-base">Admin Remarks:</h4>
                      <p className="text-blue-700 text-xs sm:text-sm">{appraisal.adminApproval.remarks}</p>
                    </div>
                  )}
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
