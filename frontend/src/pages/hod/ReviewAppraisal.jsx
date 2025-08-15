import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Calendar, Award, BookOpen, GraduationCap, Users, Briefcase, FileText, Star, Building, MapPin, Clock, CheckCircle, XCircle, MessageSquare, Download, Loader2 } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getHODAppraisalById, submitHODReview } from "../../utils/api";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const ReviewAppraisal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appraisal, setAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchAppraisal();
  }, [id]);

  const fetchAppraisal = async () => {
    try {
      const data = await getHODAppraisalById(id);
      setAppraisal(data);
    } catch (err) {
      setError(err.message || "Failed to fetch appraisal details");
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

  const InfoCard = ({ icon: Icon, title, children, className = "" }) => (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const DataField = ({ label, value, icon: Icon }) => (
    <div className="flex items-start space-x-3 py-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-1">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  const SectionCard = ({ icon: Icon, title, children, count }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="sm:flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="sm:text-base font-semibold text-gray-800">{title}</h3>
        </div>
        {count && (
          <span className=" mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
      {children}
    </div>
  );

  const ConfirmationModal = ({ action, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
            action === 'approve' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {action === 'approve' ? 
              <CheckCircle className="w-6 h-6 text-green-600" /> : 
              <XCircle className="w-6 h-6 text-red-600" />
            }
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {action === 'approve' ? 'Approve Appraisal' : 'Reject Appraisal'}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          {action === 'approve' 
            ? 'This appraisal will be forwarded to the admin for final approval.' 
            : 'This appraisal will be returned to the faculty for revision.'
          }
        </p>
        
        <div className="flex space-x-3">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${
              action === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </div>
    </div>
  );

  const handleReviewSubmit = async (action) => {
    if (!remarks.trim()) {
      showErrorToast('Please enter review comments before submitting.');
      return;
    }

    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const confirmReview = async () => {
    setShowConfirmModal(false);
    
    try {
      setSubmitting(true);
      await submitHODReview(id, pendingAction, remarks);
      
      // Show success message
      const successMessage = pendingAction === 'approve' 
        ? 'Appraisal approved and forwarded to admin successfully!' 
        : 'Appraisal rejected and returned to faculty successfully!';
      
      showSuccessToast(successMessage);
      
      // Small delay for user to see the toast, then navigate
      setTimeout(() => {
        navigate("/hod/view-appraisals");
      }, 1500);
    } catch (err) {
      showErrorToast(err.message || `Failed to ${pendingAction} appraisal`);
    } finally {
      setSubmitting(false);
      setPendingAction(null);
    }
  };

  const cancelReview = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  if (loading) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading appraisal details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Appraisal</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate("/hod/view-appraisals")} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Appraisals
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="hod">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center">
                <Button
                  variant="secondary"
                  onClick={() => navigate("/hod/view-appraisals")}
                  className="w-fit sm:mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Faculty Appraisal Review</h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Detailed review of faculty performance</p>
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                    appraisal.status
                  )}`}
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {formatStatus(appraisal.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Faculty Basic Information */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <InfoCard icon={User} title="Personal Information" className="xl:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <DataField label="Full Name" value={appraisal.fullName} icon={User} />
                <DataField label="Employee Code" value={appraisal.employeeCode} />
                <DataField label="Email Address" value={appraisal.email} icon={Mail} />
                <DataField label="Phone Number" value={appraisal.phoneNumber} icon={Phone} />
                <DataField label="Department" value={appraisal.department} icon={Building} />
                <DataField label="Designation" value={appraisal.designation} />
              </div>
            </InfoCard>

            <InfoCard icon={Calendar} title="Key Dates">
              <div className="space-y-3 sm:space-y-4">
                <DataField 
                  label="Date of Joining" 
                  value={appraisal.dateOfJoining ? new Date(appraisal.dateOfJoining).toLocaleDateString() : null} 
                  icon={Calendar} 
                />
                <DataField 
                  label="Date of Birth" 
                  value={appraisal.dateOfBirth ? new Date(appraisal.dateOfBirth).toLocaleDateString() : null} 
                  icon={Calendar} 
                />
                <DataField 
                  label="Submission Date" 
                  value={new Date(appraisal.submissionDate).toLocaleDateString()} 
                  icon={Clock} 
                />
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <DataField label="Address" value={appraisal.address} icon={MapPin} />
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Academic & Professional Sections */}
          <div className="space-y-6 sm:space-y-8">
            {/* Academic Qualifications */}
            {appraisal.academicQualifications?.length > 0 && (
              <SectionCard 
                icon={GraduationCap} 
                title="Academic Qualifications" 
                count={appraisal.academicQualifications.length}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {appraisal.academicQualifications.map((qual, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{qual.degree}</h4>
                      <p className="text-gray-700 text-xs sm:text-sm mb-1">{qual.institution}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {qual.yearOfPassing}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Research Publications */}
            {appraisal.researchPublications?.length > 0 && (
              <SectionCard 
                icon={BookOpen} 
                title="Research Publications" 
                count={appraisal.researchPublications.length}
              >
                <div className="space-y-3 sm:space-y-4">
                  {appraisal.researchPublications.map((pub, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{pub.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-700">{pub.journal}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                          {pub.year}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Projects */}
            {appraisal.projects?.length > 0 && (
              <SectionCard 
                icon={Briefcase} 
                title="Research Projects" 
                count={appraisal.projects.length}
              >
                <div className="space-y-3 sm:space-y-4">
                  {appraisal.projects.map((project, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{project.title}</h4>
                      <p className="text-gray-700 text-xs sm:text-sm mb-2">{project.description}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                        {project.year}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Awards & Recognition */}
            {appraisal.awardsRecognitions?.length > 0 && (
              <SectionCard 
                icon={Award} 
                title="Awards & Recognition" 
                count={appraisal.awardsRecognitions.length}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {appraisal.awardsRecognitions.map((award, index) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                      <div className="flex items-start">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 mt-1 flex-shrink-0">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{award.title}</h4>
                          <p className="text-gray-700 text-xs sm:text-sm mb-1">{award.organization}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                            {award.year}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
            {/* Seminars & Workshops */}
            {appraisal.seminars?.length > 0 && (
              <SectionCard 
                icon={Users} 
                title="Seminars & Workshops" 
                count={appraisal.seminars.length}
              >
                <div className="space-y-3 sm:space-y-4">
                  {appraisal.seminars.map((seminar, index) => (
                    <div key={index} className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-3 sm:p-4 border border-teal-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{seminar.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-700">{seminar.venue}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-teal-100 text-teal-800">
                          Date :{new Date(seminar.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Lectures */}
            {appraisal.lectures?.length > 0 && (
              <SectionCard 
                icon={GraduationCap} 
                title="Guest Lectures" 
                count={appraisal.lectures.length}
              >
                <div className="space-y-3 sm:space-y-4">
                  {appraisal.lectures.map((lecture, index) => (
                    <div key={index} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-3 sm:p-4 border border-pink-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{lecture.topic}</h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-pink-100 text-pink-800">
                        Date : {new Date(lecture.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Professional Memberships */}
            {appraisal.professionalMemberships?.length > 0 && (
              <SectionCard 
                icon={Users} 
                title="Professional Memberships" 
                count={appraisal.professionalMemberships.filter(m => m.trim()).length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {appraisal.professionalMemberships.filter(membership => membership.trim()).map((membership, index) => (
                    <div key={index} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-indigo-200">
                      <div className="flex items-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{membership}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Teaching & Administrative */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              {/* Courses Taught */}
              {appraisal.coursesTaught?.length > 0 && (
                <SectionCard 
                  icon={GraduationCap} 
                  title="Courses Taught" 
                  count={appraisal.coursesTaught.length}
                >
                  <div className="space-y-2 sm:space-y-3">
                    {appraisal.coursesTaught.map((course, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 text-sm sm:text-base">{course.courseName}</h4>
                        <p className="text-blue-700 text-xs sm:text-sm">Semester: {course.semester}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Administrative Responsibilities */}
              {appraisal.administrativeResponsibilities?.length > 0 && (
                <SectionCard 
                  icon={Building} 
                  title="Administrative Roles" 
                  count={appraisal.administrativeResponsibilities.length}
                >
                  <div className="space-y-2 sm:space-y-3">
                    {appraisal.administrativeResponsibilities.map((resp, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{resp.role}</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">Duration: {resp.duration}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

{/* Student Mentoring */}
            {appraisal.studentMentoring?.length > 0 && (
              <SectionCard 
                icon={Users} 
                title="Student Mentoring" 
                count={appraisal.studentMentoring.length}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {appraisal.studentMentoring.map((mentoring, index) => (
                    <div key={index} className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 sm:p-4 border border-emerald-200">
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{mentoring.studentName}</h4>
                      <p className="text-gray-700 text-xs sm:text-sm mb-1">{mentoring.projectTitle}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800">
                        {mentoring.year}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Files Section */}
            {appraisal.uploadedFiles?.length > 0 && (
              <SectionCard 
                icon={FileText} 
                title="Supporting Documents" 
                count={appraisal.uploadedFiles.length}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {appraisal.uploadedFiles.map((file, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                        {file.fileUrl && (
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors ml-2"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            View
                          </a>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base truncate">{file.fileName}</h4>
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Previous Reviews */}
            {(appraisal.hodApproval?.remarks || appraisal.adminApproval?.remarks) && (
              <SectionCard icon={MessageSquare} title="Previous Reviews">
                <div className="space-y-3 sm:space-y-4">
                  {appraisal.hodApproval?.remarks && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 mt-1 flex-shrink-0">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-yellow-900 mb-2 text-sm sm:text-base">HOD Review</h4>
                          <p className="text-yellow-800 mb-2 text-xs sm:text-sm">{appraisal.hodApproval.remarks}</p>
                          {appraisal.hodApproval.date && (
                            <p className="text-xs text-yellow-700">
                              Reviewed on: {new Date(appraisal.hodApproval.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {appraisal.adminApproval?.remarks && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 mt-1 flex-shrink-0">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Admin Review</h4>
                          <p className="text-blue-800 mb-2 text-xs sm:text-sm">{appraisal.adminApproval.remarks}</p>
                          {appraisal.adminApproval.date && (
                            <p className="text-xs text-blue-700">
                              Reviewed on: {new Date(appraisal.adminApproval.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* HOD Review Actions */}
            {appraisal.status === 'pending_hod' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  HOD Review & Decision
                </h3>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Comments <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="Enter your review comments..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      disabled={submitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide clear feedback about the appraisal quality and any required improvements.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                      onClick={() => handleReviewSubmit('approve')}
                      className="bg-green-600 hover:bg-green-700 flex-1 transition-all duration-200"
                      disabled={submitting || !remarks.trim()}
                    >
                      {submitting && pendingAction === 'approve' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Approve & Forward to Admin</span>
                          <span className="sm:hidden">Approve</span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReviewSubmit('reject')}
                      variant="secondary"
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600 flex-1 transition-all duration-200"
                      disabled={submitting || !remarks.trim()}
                    >
                      {submitting && pendingAction === 'reject' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Reject & Return to Faculty</span>
                          <span className="sm:hidden">Reject</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <ConfirmationModal
            action={pendingAction}
            onConfirm={confirmReview}
            onCancel={cancelReview}
          />
        )}

        {/* Processing Overlay */}
        {submitting && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex items-center space-x-3 max-w-sm w-full">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium text-sm sm:text-base">
                {pendingAction === 'approve' ? 'Approving appraisal...' : 'Rejecting appraisal...'}
              </span>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReviewAppraisal;
