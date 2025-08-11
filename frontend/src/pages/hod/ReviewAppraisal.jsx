import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Calendar, Award, BookOpen, GraduationCap, Users, Briefcase, FileText, Star, Building } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getHODAppraisalById } from "../../utils/api";

const ReviewAppraisal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appraisal, setAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetchAppraisal();
  }, [id]);

const backendUrl = 'http://localhost:5000';
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

  if (loading) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">Loading appraisal details...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout allowedRole="hod">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
            <Button onClick={() => navigate("/hod/view-appraisals")}>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="secondary"
              onClick={() => navigate("/hod/view-appraisals")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Appraisals
            </Button>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                appraisal.status
              )}`}
            >
              {formatStatus(appraisal.status)}
            </span>
          </div>

          {/* Faculty Information */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Faculty Appraisal Review</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Faculty Name</p>
                    <p className="font-semibold">{appraisal.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{appraisal.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{appraisal.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Employee Code</p>
                  <p className="font-semibold">{appraisal.employeeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold">{appraisal.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-semibold">{appraisal.designation || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Date of Joining</p>
                  <p className="font-semibold">
                    {appraisal.dateOfJoining ? new Date(appraisal.dateOfJoining).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-semibold">
                    {appraisal.dateOfBirth ? new Date(appraisal.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">{appraisal.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Qualifications */}
          {appraisal.academicQualifications?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Academic Qualifications
              </h3>
              <div className="space-y-3">
                {appraisal.academicQualifications.map((qual, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{qual.degree}</h4>
                    <p className="text-gray-600">{qual.institution}</p>
                    <p className="text-sm text-gray-500">Year: {qual.yearOfPassing}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Publications */}
          {appraisal.researchPublications?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Research Publications
              </h3>
              <div className="space-y-3">
                {appraisal.researchPublications.map((pub, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{pub.title}</h4>
                    <p className="text-gray-600">{pub.journal} - {pub.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seminars */}
          {appraisal.seminars?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Seminars Attended
              </h3>
              <div className="space-y-3">
                {appraisal.seminars.map((seminar, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{seminar.title}</h4>
                    <p className="text-gray-600">Venue: {seminar.venue}</p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(seminar.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {appraisal.projects?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Projects
              </h3>
              <div className="space-y-3">
                {appraisal.projects.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{project.title}</h4>
                    <p className="text-gray-600">{project.description}</p>
                    <p className="text-sm text-gray-500">Year: {project.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lectures */}
          {appraisal.lectures?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Lectures Delivered
              </h3>
              <div className="space-y-3">
                {appraisal.lectures.map((lecture, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{lecture.topic}</h4>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(lecture.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards & Recognitions */}
          {appraisal.awardsRecognitions?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Awards & Recognitions
              </h3>
              <div className="space-y-3">
                {appraisal.awardsRecognitions.map((award, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{award.title}</h4>
                    <p className="text-gray-600">{award.organization}</p>
                    <p className="text-sm text-gray-500">Year: {award.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Memberships */}
          {appraisal.professionalMemberships?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Professional Memberships
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {appraisal.professionalMemberships.map((membership, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <p className="font-semibold">{membership}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses Taught */}
          {appraisal.coursesTaught?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Courses Taught
              </h3>
              <div className="space-y-3">
                {appraisal.coursesTaught.map((course, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{course.courseName}</h4>
                    <p className="text-gray-600">Semester: {course.semester}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Administrative Responsibilities */}
          {appraisal.administrativeResponsibilities?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Administrative Responsibilities
              </h3>
              <div className="space-y-3">
                {appraisal.administrativeResponsibilities.map((resp, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{resp.role}</h4>
                    <p className="text-gray-600">Duration: {resp.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Mentoring */}
          {appraisal.studentMentoring?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Student Mentoring
              </h3>
              <div className="space-y-3">
                {appraisal.studentMentoring.map((mentoring, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{mentoring.studentName}</h4>
                    <p className="text-gray-600">Project: {mentoring.projectTitle}</p>
                    <p className="text-sm text-gray-500">Year: {mentoring.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Files */}
          {appraisal.uploadedFiles?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Uploaded Files
              </h3>
              <div className="space-y-3">
                {appraisal.uploadedFiles.map((file, index) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{file.fileName}</h4>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
{file.fileUrl && (
  <a
    href={`${backendUrl}${file.fileUrl}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 hover:text-blue-700"
  >
    View File
  </a>
)}
</div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Reviews */}
          {(appraisal.hodApproval?.remarks || appraisal.adminApproval?.remarks) && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Previous Reviews</h3>
              
              {appraisal.hodApproval?.remarks && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">HOD Review</h4>
                  <p className="text-yellow-700">{appraisal.hodApproval.remarks}</p>
                  {appraisal.hodApproval.date && (
                    <p className="text-sm text-yellow-600 mt-2">
                      Reviewed on: {new Date(appraisal.hodApproval.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {appraisal.adminApproval?.remarks && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Admin Review</h4>
                  <p className="text-blue-700">{appraisal.adminApproval.remarks}</p>
                  {appraisal.adminApproval.date && (
                    <p className="text-sm text-blue-600 mt-2">
                      Reviewed on: {new Date(appraisal.adminApproval.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submission Details */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              Submitted on: {new Date(appraisal.submissionDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReviewAppraisal;
