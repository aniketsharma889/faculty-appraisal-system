import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Mail, Phone, Calendar, Award, BookOpen, GraduationCap, 
  Users, Briefcase, FileText, Star, Building, MapPin, Clock, Download,
  CheckCircle, XCircle, AlertCircle, Loader2
} from "lucide-react";
import html2pdf from 'html2pdf.js';
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
      
      // Show loading state
      const loadingToast = document.createElement('div');
      loadingToast.textContent = 'Generating PDF...';
      loadingToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#4f46e5;color:white;padding:12px 20px;border-radius:8px;z-index:1000;font-family:Arial,sans-serif;';
      document.body.appendChild(loadingToast);

      // Helper functions for PDF generation
      const isImageFile = (fileName) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        const extension = fileName.split('.').pop().toLowerCase();
        return imageExtensions.includes(extension);
      };

      const isPDFFile = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        return extension === 'pdf';
      };

      const getFileTypeIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
          return '🖼️';
        } else if (extension === 'pdf') {
          return '📄';
        } else if (['doc', 'docx'].includes(extension)) {
          return '📝';
        } else if (['zip', 'rar', '7z'].includes(extension)) {
          return '📦';
        } else {
          return '📎';
        }
      };

      const reportDate = new Date().toLocaleDateString();
      const reportTime = new Date().toLocaleTimeString();
      
      // Create HTML content for PDF
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.5;">
          <!-- Header with Faculty Profile -->
          <div style="text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold; margin-bottom: 15px;">
              ${appraisal.fullName?.charAt(0).toUpperCase()}
            </div>
            <h1 style="color: #1e40af; margin: 0; font-size: 28px;">Faculty Appraisal Report</h1>
            <p style="margin: 5px 0; font-weight: bold; font-size: 18px;">${appraisal.fullName}</p>
            <p style="margin: 5px 0; color: #666;">${appraisal.department} • ${appraisal.designation}</p>
            <p style="margin: 5px 0; color: #666;">Employee Code: ${appraisal.employeeCode}</p>
            <div style="margin: 10px 0;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; ${
                appraisal.status === 'approved' ? 'background: #dcfce7; color: #166534;' : 
                appraisal.status === 'rejected' ? 'background: #fef2f2; color: #dc2626;' :
                appraisal.status === 'pending_admin' ? 'background: #dbeafe; color: #1d4ed8;' :
                'background: #fef3c7; color: #d97706;'
              }">
                ${statusConfig.label}
              </span>
            </div>
            <p style="margin: 10px 0; color: #666;">Generated on: ${reportDate} at ${reportTime}</p>
          </div>

          <!-- Personal Information -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">Personal Information</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                <div style="font-weight: bold; color: #374151; margin-bottom: 5px;">📧 Contact Information</div>
                <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                  <div>📧 ${appraisal.email}</div>
                  ${hasValue(appraisal.phoneNumber) ? `<div>📞 ${appraisal.phoneNumber}</div>` : ''}
                  ${hasValue(appraisal.address) ? `<div>📍 ${appraisal.address}</div>` : ''}
                </div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                <div style="font-weight: bold; color: #374151; margin-bottom: 5px;">📅 Important Dates</div>
                <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                  ${hasValue(appraisal.dateOfJoining) ? `<div>Joined: ${new Date(appraisal.dateOfJoining).toLocaleDateString()}</div>` : ''}
                  ${hasValue(appraisal.dateOfBirth) ? `<div>Born: ${new Date(appraisal.dateOfBirth).toLocaleDateString()}</div>` : ''}
                  <div>Submitted: ${new Date(appraisal.submissionDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          ${hasValue(appraisal.academicQualifications) ? `
          <!-- Academic Qualifications -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">🎓 Academic Qualifications</h2>
            ${appraisal.academicQualifications.filter(q => hasValue(q.degree)).map(qual => `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">${qual.degree}</div>
                ${hasValue(qual.institution) ? `<div style="color: #6b7280; font-size: 14px;">🏛️ ${qual.institution}</div>` : ''}
                ${hasValue(qual.yearOfPassing) ? `<div style="color: #6b7280; font-size: 14px;">📅 ${qual.yearOfPassing}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${hasValue(appraisal.researchPublications) ? `
          <!-- Research Publications -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">📚 Research Publications</h2>
            ${appraisal.researchPublications.filter(p => hasValue(p.title)).map(pub => `
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">${pub.title}</div>
                ${hasValue(pub.journal) ? `<div style="color: #059669; font-size: 14px;">📖 ${pub.journal}</div>` : ''}
                ${hasValue(pub.year) ? `<div style="color: #059669; font-size: 14px;">📅 ${pub.year}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${hasValue(appraisal.projects) ? `
          <!-- Research Projects -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">🔬 Research Projects</h2>
            ${appraisal.projects.filter(p => hasValue(p.title)).map(project => `
              <div style="background: #faf5ff; border: 1px solid #d8b4fe; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">${project.title}</div>
                ${hasValue(project.description) ? `<div style="color: #7c3aed; font-size: 14px; margin-bottom: 5px;">${project.description}</div>` : ''}
                ${hasValue(project.year) ? `<div style="color: #7c3aed; font-size: 14px;">📅 ${project.year}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${hasValue(appraisal.awardsRecognitions) ? `
          <!-- Awards & Recognition -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">🏆 Awards & Recognition</h2>
            ${appraisal.awardsRecognitions.filter(a => hasValue(a.title)).map(award => `
              <div style="background: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">🏆 ${award.title}</div>
                ${hasValue(award.organization) ? `<div style="color: #d97706; font-size: 14px;">🏛️ ${award.organization}</div>` : ''}
                ${hasValue(award.year) ? `<div style="color: #d97706; font-size: 14px;">📅 ${award.year}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${hasValue(appraisal.seminars) ? `
          <!-- Seminars & Workshops -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">👥 Seminars & Workshops</h2>
            ${appraisal.seminars.filter(s => hasValue(s.title)).map(seminar => `
              <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">${seminar.title}</div>
                ${hasValue(seminar.venue) ? `<div style="color: #0891b2; font-size: 14px;">📍 ${seminar.venue}</div>` : ''}
                ${hasValue(seminar.date) ? `<div style="color: #0891b2; font-size: 14px;">📅 ${new Date(seminar.date).toLocaleDateString()}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${hasValue(appraisal.lectures) ? `
          <!-- Guest Lectures -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">🎤 Guest Lectures</h2>
            ${appraisal.lectures.filter(l => hasValue(l.topic)).map(lecture => `
              <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">${lecture.topic}</div>
                ${hasValue(lecture.date) ? `<div style="color: #be185d; font-size: 14px;">📅 ${new Date(lecture.date).toLocaleDateString()}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${hasValue(appraisal.professionalMemberships) ? `
          <!-- Professional Memberships -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">⭐ Professional Memberships</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              ${appraisal.professionalMemberships.filter(m => hasValue(m)).map(membership => `
                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px; text-align: center;">
                  <div style="font-weight: bold; color: #1f2937;">⭐ ${membership}</div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          ${hasValue(appraisal.coursesTaught) ? `
          <!-- Courses Taught -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">📖 Courses Taught</h2>
            ${appraisal.coursesTaught.filter(c => hasValue(c.courseName)).map(course => `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">📖 ${course.courseName}</div>
                ${hasValue(course.semester) ? `<div style="color: #6b7280; font-size: 14px;">Semester: ${course.semester}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${hasValue(appraisal.administrativeResponsibilities) ? `
          <!-- Administrative Responsibilities -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">🏢 Administrative Responsibilities</h2>
            ${appraisal.administrativeResponsibilities.filter(r => hasValue(r.role)).map(resp => `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">🏢 ${resp.role}</div>
                ${hasValue(resp.duration) ? `<div style="color: #6b7280; font-size: 14px;">Duration: ${resp.duration}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${hasValue(appraisal.studentMentoring) ? `
          <!-- Student Mentoring -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">🎓 Student Mentoring</h2>
            ${appraisal.studentMentoring.filter(m => hasValue(m.studentName)).map(mentoring => `
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">👨‍🎓 ${mentoring.studentName}</div>
                ${hasValue(mentoring.projectTitle) ? `<div style="color: #059669; font-size: 14px; margin-bottom: 5px;">Project: ${mentoring.projectTitle}</div>` : ''}
                ${hasValue(mentoring.year) ? `<div style="color: #059669; font-size: 14px;">📅 ${mentoring.year}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${hasValue(appraisal.uploadedFiles) ? `
          <!-- Supporting Documents -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">📎 Supporting Documents</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              ${appraisal.uploadedFiles.map(file => `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 20px; margin-right: 10px;">${getFileTypeIcon(file.fileName)}</span>
                    <div style="flex: 1;">
                      <div style="font-weight: bold; color: #1f2937; font-size: 14px; margin-bottom: 3px;">${file.fileName}</div>
                      <div style="color: #6b7280; font-size: 12px;">Uploaded: ${new Date(file.uploadedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style="color: #3b82f6; font-size: 11px; word-break: break-all;">
                    <a href="${file.fileUrl}" target="_blank" style="color: #3b82f6; text-decoration: none;">🔗 ${file.fileUrl}</a>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          ${(hasValue(appraisal.hodApproval?.remarks) || hasValue(appraisal.adminApproval?.remarks)) ? `
          <!-- Review Comments -->
          <div style="margin-bottom: 30px;">
            <h2 style="background: #3b82f6; color: white; padding: 10px 15px; margin: 0 0 20px 0; font-size: 18px;">💬 Review Comments</h2>
            ${hasValue(appraisal.hodApproval?.remarks) ? `
              <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <div style="font-weight: bold; color: #92400e; margin-bottom: 8px;">🏛️ HOD Review</div>
                <div style="color: #92400e; font-size: 14px; line-height: 1.6;">${appraisal.hodApproval.remarks}</div>
                ${appraisal.hodApproval.date ? `<div style="color: #a16207; font-size: 12px; margin-top: 8px;">Reviewed: ${new Date(appraisal.hodApproval.date).toLocaleDateString()}</div>` : ''}
              </div>` : ''}
            ${hasValue(appraisal.adminApproval?.remarks) ? `
              <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px;">
                <div style="font-weight: bold; color: #1d4ed8; margin-bottom: 8px;">👨‍💼 Admin Review</div>
                <div style="color: #1d4ed8; font-size: 14px; line-height: 1.6;">${appraisal.adminApproval.remarks}</div>
                ${appraisal.adminApproval.date ? `<div style="color: #1e40af; font-size: 12px; margin-top: 8px;">Reviewed: ${new Date(appraisal.adminApproval.date).toLocaleDateString()}</div>` : ''}
              </div>` : ''}
          </div>` : ''}

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 12px;">
            <p>This report was automatically generated by the Faculty Appraisal System</p>
            <p>Generated on: ${reportDate} at ${reportTime}</p>
            <p style="margin-top: 10px; font-style: italic;">This is a comprehensive appraisal report for ${appraisal.fullName}</p>
          </div>
        </div>
      `;

      // Configure PDF options
      const opt = {
        margin: 1,
        filename: `${appraisal.fullName}_Appraisal_${new Date().toISOString().split('T')[0]}.pdf`,
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

      showSuccessToast('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Remove loading toast if it exists
      const loadingToast = document.querySelector('div[style*="Generating PDF"]');
      if (loadingToast) {
        document.body.removeChild(loadingToast);
      }
      
      showErrorToast('Failed to download PDF');
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
