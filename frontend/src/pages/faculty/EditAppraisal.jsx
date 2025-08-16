import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EditAppraisalForm from "../../components/forms/EditAppraisalForm";
import { getAppraisalById } from "../../utils/api";

const EditAppraisal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appraisal, setAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppraisal();
  }, [id]);

  const fetchAppraisal = async () => {
    try {
      console.log('Fetching appraisal for ID:', id); // Debug log
      const data = await getAppraisalById(id);
      console.log('Fetched appraisal:', data); // Debug log
      setAppraisal(data);
    } catch (err) {
      console.error('Error fetching appraisal:', err); // Debug log
      setError(err.message || "Failed to fetch appraisal");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout allowedRole="faculty">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <span className="text-gray-600 text-sm sm:text-base">Loading appraisal...</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout allowedRole="faculty">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
              <button 
                onClick={() => navigate("/faculty/view-appraisals")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
              >
                Back to Appraisals
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="faculty">
      <EditAppraisalForm appraisal={appraisal} />
    </DashboardLayout>
  );
};

export default EditAppraisal;
