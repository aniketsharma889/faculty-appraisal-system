import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import PersonalInformationSection from "./sections/PersonalInformationSection";
import ProfessionalInformationSection from "./sections/ProfessionalInformationSection";
import FileUploadSection from "./sections/FileUploadSection";
import Button from "../ui/Button";
import { updateAppraisal } from "../../utils/api";

const AppraisalSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  employeeCode: Yup.string().required("Employee code is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  department: Yup.string().required("Department is required"),
  designation: Yup.string().required("Designation is required"),
  dateOfJoining: Yup.date().required("Date of joining is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
  address: Yup.string().required("Address is required"),
});

const EditAppraisalForm = ({ appraisal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const navigate = useNavigate();

  const sections = [
    { title: "Personal Information", component: PersonalInformationSection },
    { title: "Professional Information", component: ProfessionalInformationSection },
    { title: "File Upload", component: FileUploadSection }
  ];

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
  };

  const initialValues = {
    fullName: appraisal.fullName || "",
    employeeCode: appraisal.employeeCode || "",
    email: appraisal.email || "",
    phoneNumber: appraisal.phoneNumber || "",
    department: appraisal.department || "",
    designation: appraisal.designation || "",
    dateOfJoining: formatDateForInput(appraisal.dateOfJoining),
    dateOfBirth: formatDateForInput(appraisal.dateOfBirth),
    address: appraisal.address || "",
    academicQualifications: appraisal.academicQualifications || [{ degree: "", institution: "", yearOfPassing: "" }],
    researchPublications: appraisal.researchPublications || [{ title: "", journal: "", year: "" }],
    seminars: appraisal.seminars || [{ title: "", date: "", venue: "" }],
    projects: appraisal.projects || [{ title: "", description: "", year: "" }],
    lectures: appraisal.lectures || [{ topic: "", date: "" }],
    awardsRecognitions: appraisal.awardsRecognitions || [{ title: "", year: "", organization: "" }],
    professionalMemberships: appraisal.professionalMemberships || [""],
    coursesTaught: appraisal.coursesTaught || [{ courseName: "", semester: "" }],
    administrativeResponsibilities: appraisal.administrativeResponsibilities || [{ role: "", duration: "" }],
    studentMentoring: appraisal.studentMentoring || [{ studentName: "", year: "", projectTitle: "" }],
    uploadedFiles: appraisal.uploadedFiles || []
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setApiError("");

    try {
      await updateAppraisal(appraisal._id, values);
      navigate("/faculty/view-appraisals", { 
        state: { message: "Appraisal updated successfully!" }
      });
    } catch (error) {
      setApiError(error.message || "Failed to update appraisal");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Only submit if we're on the last section
    if (currentSection === sections.length - 1) {
      // Trigger Formik submit
      const formElement = e.target.closest('form');
      if (formElement) {
        formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    } else {
      nextSection();
    }
  };

  const canEdit = appraisal.status === 'pending_hod' || appraisal.status === 'rejected';

  if (!canEdit) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            This appraisal cannot be edited because it has already been reviewed by HOD or approved.
          </div>
          <Button onClick={() => navigate("/faculty/view-appraisals")} variant="secondary">
            Back to Appraisals
          </Button>
        </div>
      </div>
    );
  }

  const CurrentSectionComponent = sections[currentSection].component;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Edit Appraisal Form</h1>
            <Button 
              onClick={() => navigate("/faculty/view-appraisals")} 
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>

          {appraisal.status === 'rejected' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6 text-sm sm:text-base">
              <strong>Rejected Appraisal:</strong> You can edit and resubmit this appraisal.
              {appraisal.hodApproval?.remarks && (
                <div className="mt-2">
                  <strong>HOD Remarks:</strong> {appraisal.hodApproval.remarks}
                </div>
              )}
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
              {sections.map((section, index) => (
                <span
                  key={index}
                  className={`text-xs sm:text-sm font-medium mb-1 sm:mb-0 ${
                    index <= currentSection ? "text-indigo-600" : "text-gray-400"
                  }`}
                >
                  {section.title}
                </span>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6 text-sm sm:text-base">
              {apiError}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={AppraisalSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {(formikProps) => (
              <Form onSubmit={(e) => e.preventDefault()}>
                <CurrentSectionComponent formikProps={formikProps} />

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 space-y-4 sm:space-y-0">
                  <Button
                    type="button"
                    onClick={prevSection}
                    variant="secondary"
                    disabled={currentSection === 0}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Previous
                  </Button>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto order-1 sm:order-2">
                    {currentSection < sections.length - 1 ? (
                      <Button 
                        type="button" 
                        onClick={nextSection}
                        className="w-full sm:w-auto"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        type="button"
                        onClick={() => formikProps.handleSubmit()}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      >
                        {isLoading ? "Updating..." : "Update Appraisal"}
                      </Button>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default EditAppraisalForm;
