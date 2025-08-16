import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Mail, Phone, Calendar, Award, BookOpen, GraduationCap, 
  Users, Briefcase, FileText, Star, Building, MapPin, Clock, Download,
  CheckCircle, XCircle, AlertCircle, Loader2
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getAppraisalById } from "../../utils/api";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const ViewAppraisalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appraisal, setAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    fetchAppraisal();
  }, [id]);

  const fetchAppraisal = async () => {
    try {
      const data = await getAppraisalById(id);
      setAppraisal(data);
    } catch (err) {
      setError(err.message || "Failed to fetch appraisal details");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/appraisal-form/download-pdf/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${appraisal.fullName}_Appraisal_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSuccessToast('PDF downloaded successfully!');
    } catch (error) {
      showErrorToast('Failed to download PDF');
      console.error('Download error:', error);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending_hod: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: AlertCircle,
        label: "Pending HOD Review"
      },
      pending_admin: {
        color: "bg-blue-100 text-blue-800 border-blue-300", 
        icon: Clock,
        label: "Pending Admin Review"
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
        label: "Approved"
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: XCircle,
        label: "Rejected"
      }
    };
    return configs[status] || configs.pending_hod;
  };

  // Helper function to check if a value exists and is not empty
  const hasValue = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0 && value.some(item => {
        if (typeof item === 'string') return item.trim() !== '';
        if (typeof item === 'object') return Object.values(item).some(v => v && v.toString().trim() !== '');
        return Boolean(item);
      });
    }
    return value && value.toString().trim() !== '';
  };

  const InfoCard = ({ icon: Icon, title, children, className = "" }) => (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const DataField = ({ label, value, icon: Icon }) => {
    if (!hasValue(value)) return null;
    
    return (
      <div className="flex items-start space-x-3 py-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    );
  };

  const SectionCard = ({ icon: Icon, title, children, count }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {count && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout allowedRole="faculty">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading appraisal details...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !appraisal) {
    return (
      <DashboardLayout allowedRole="faculty">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error Loading Appraisal</h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
              <Button onClick={() => navigate("/faculty/view-appraisals")} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Appraisals
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(appraisal.status);
  const StatusIcon = statusConfig.icon;

  return (
    <DashboardLayout allowedRole="faculty">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header - Responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center">
                <Button
                  variant="secondary"
                  onClick={() => navigate("/faculty/view-appraisals")}
                  className="w-fit sm:mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Appraisal Details</h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">View your submitted appraisal information</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3">
                <span className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border ${statusConfig.color} self-start sm:self-auto`}>
                  <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {statusConfig.label}
                </span>
                <Button
                  onClick={downloadPDF}
                  disabled={downloadingPDF}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  {downloadingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Generating...</span>
                      <span className="sm:hidden">Loading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Download PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Personal Information - Responsive Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
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

            <InfoCard icon={Calendar} title="Important Dates">
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

          {/* Professional Information Sections - Only show if they have data */}
          <div className="space-y-6 sm:space-y-8">
            {/* Academic Qualifications */}
            {hasValue(appraisal.academicQualifications) && (
              <SectionCard 
                icon={GraduationCap} 
                title="Academic Qualifications" 
                count={appraisal.academicQualifications.filter(q => hasValue(q.degree)).length}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {appraisal.academicQualifications.filter(q => hasValue(q.degree)).map((qual, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{qual.degree}</h4>
                      {hasValue(qual.institution) && <p className="text-gray-700 text-xs sm:text-sm mb-1">{qual.institution}</p>}
                      {hasValue(qual.yearOfPassing) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                          {qual.yearOfPassing}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Research Publications */}
            {hasValue(appraisal.researchPublications) && (
              <SectionCard 
                icon={BookOpen} 
                title="Research Publications" 
                count={appraisal.researchPublications.filter(p => hasValue(p.title)).length}
              >
                <div className="space-y-3 sm:space-y-4">
                  {appraisal.researchPublications.filter(p => hasValue(p.title)).map((pub, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{pub.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        {hasValue(pub.journal) && <span className="text-gray-700">{pub.journal}</span>}
                        {hasValue(pub.journal) && hasValue(pub.year) && <span className="w-1 h-1 bg-gray-400 rounded-full"></span>}
                        {hasValue(pub.year) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                            {pub.year}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Projects */}
            {hasValue(appraisal.projects) && (
              <SectionCard 
                icon={Briefcase} 
                title="Research Projects" 
                count={appraisal.projects.filter(p => hasValue(p.title)).length}
              >
                <div className="space-y-3 sm:space-y-4">
                  {appraisal.projects.filter(p => hasValue(p.title)).map((project, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{project.title}</h4>
                      {hasValue(project.description) && <p className="text-gray-700 text-xs sm:text-sm mb-2">{project.description}</p>}
                      {hasValue(project.year) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                          {project.year}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Awards & Recognition */}
            {hasValue(appraisal.awardsRecognitions) && (
              <SectionCard 
                icon={Award} 
                title="Awards & Recognition" 
                count={appraisal.awardsRecognitions.filter(a => hasValue(a.title)).length}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {appraisal.awardsRecognitions.filter(a => hasValue(a.title)).map((award, index) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                      <div className="flex items-start">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 mt-1 flex-shrink-0">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{award.title}</h4>
                          {hasValue(award.organization) && <p className="text-gray-700 text-xs sm:text-sm mb-1">{award.organization}</p>}
                          {hasValue(award.year) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                              {award.year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Seminars & Workshops */}
            {hasValue(appraisal.seminars) && (
              <SectionCard 
                icon={Users} 
                title="Seminars & Workshops" 
                count={appraisal.seminars.filter(s => hasValue(s.title)).length}
              >
                <div className="space-y-3 sm:space-y-4">
                  {appraisal.seminars.filter(s => hasValue(s.title)).map((seminar, index) => (
                    <div key={index} className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-3 sm:p-4 border border-teal-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{seminar.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        {hasValue(seminar.venue) && <span className="text-gray-700">{seminar.venue}</span>}
                        {hasValue(seminar.venue) && hasValue(seminar.date) && <span className="w-1 h-1 bg-gray-400 rounded-full"></span>}
                        {hasValue(seminar.date) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-teal-100 text-teal-800">
                            {new Date(seminar.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Lectures */}
            {hasValue(appraisal.lectures) && (
              <SectionCard 
                icon={GraduationCap} 
                title="Guest Lectures" 
                count={appraisal.lectures.filter(l => hasValue(l.topic)).length}
              >
                <div className="space-y-3 sm:space-y-4">
                  {appraisal.lectures.filter(l => hasValue(l.topic)).map((lecture, index) => (
                    <div key={index} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-3 sm:p-4 border border-pink-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{lecture.topic}</h4>
                      {hasValue(lecture.date) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-pink-100 text-pink-800">
                          {new Date(lecture.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Professional Memberships */}
            {hasValue(appraisal.professionalMemberships) && (
              <SectionCard 
                icon={Users} 
                title="Professional Memberships" 
                count={appraisal.professionalMemberships.filter(m => hasValue(m)).length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {appraisal.professionalMemberships.filter(m => hasValue(m)).map((membership, index) => (
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
              {hasValue(appraisal.coursesTaught) && (
                <SectionCard 
                  icon={GraduationCap} 
                  title="Courses Taught" 
                  count={appraisal.coursesTaught.filter(c => hasValue(c.courseName)).length}
                >
                  <div className="space-y-2 sm:space-y-3">
                    {appraisal.coursesTaught.filter(c => hasValue(c.courseName)).map((course, index) => (
                      <div key={index} className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <h4 className="font-semibold text-indigo-900 text-sm sm:text-base">{course.courseName}</h4>
                        {hasValue(course.semester) && <p className="text-indigo-700 text-xs sm:text-sm">Semester: {course.semester}</p>}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Administrative Responsibilities */}
              {hasValue(appraisal.administrativeResponsibilities) && (
                <SectionCard 
                  icon={Building} 
                  title="Administrative Roles" 
                  count={appraisal.administrativeResponsibilities.filter(r => hasValue(r.role)).length}
                >
                  <div className="space-y-2 sm:space-y-3">
                    {appraisal.administrativeResponsibilities.filter(r => hasValue(r.role)).map((resp, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{resp.role}</h4>
                        {hasValue(resp.duration) && <p className="text-gray-700 text-xs sm:text-sm">Duration: {resp.duration}</p>}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Student Mentoring */}
            {hasValue(appraisal.studentMentoring) && (
              <SectionCard 
                icon={Users} 
                title="Student Mentoring" 
                count={appraisal.studentMentoring.filter(m => hasValue(m.studentName)).length}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {appraisal.studentMentoring.filter(m => hasValue(m.studentName)).map((mentoring, index) => (
                    <div key={index} className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 sm:p-4 border border-emerald-200">
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{mentoring.studentName}</h4>
                      {hasValue(mentoring.projectTitle) && <p className="text-gray-700 text-xs sm:text-sm mb-1">{mentoring.projectTitle}</p>}
                      {hasValue(mentoring.year) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800">
                          {mentoring.year}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Files Section */}
            {hasValue(appraisal.uploadedFiles) && (
              <SectionCard 
                icon={FileText} 
                title="Supporting Documents" 
                count={appraisal.uploadedFiles.length}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {appraisal.uploadedFiles.map((file, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 flex-shrink-0" />
                        {file.fileUrl && (
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors ml-2"
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

            {/* Review Comments */}
            {(hasValue(appraisal.hodApproval?.remarks) || hasValue(appraisal.adminApproval?.remarks)) && (
              <SectionCard icon={FileText} title="Review Comments">
                <div className="space-y-3 sm:space-y-4">
                  {hasValue(appraisal.hodApproval?.remarks) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs font-medium text-yellow-800 mb-1">HOD Review:</p>
                      <p className="text-sm text-yellow-700">{appraisal.hodApproval.remarks}</p>
                      {appraisal.hodApproval.date && (
                        <p className="text-xs text-yellow-600 mt-2">
                          Reviewed on: {new Date(appraisal.hodApproval.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  {hasValue(appraisal.adminApproval?.remarks) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs font-medium text-blue-800 mb-1">Admin Review:</p>
                      <p className="text-sm text-blue-700">{appraisal.adminApproval.remarks}</p>
                      {appraisal.adminApproval.date && (
                        <p className="text-xs text-blue-600 mt-2">
                          Reviewed on: {new Date(appraisal.adminApproval.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewAppraisalDetails;
