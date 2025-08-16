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
  const [sectionErrors, setSectionErrors] = useState({});
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

    // Additional frontend validation to prevent empty submissions (same as AppraisalForm)
    const validateRequiredArrays = (arrayData, fieldName, requiredFields = []) => {
      if (!Array.isArray(arrayData) || arrayData.length === 0) {
        return `At least one ${fieldName} entry is required`;
      }
      
      const firstEntry = arrayData[0];
      for (const field of requiredFields) {
        if (!firstEntry[field] || firstEntry[field].toString().trim() === '') {
          return `${fieldName}: ${field} is required in the first entry`;
        }
      }
      return null;
    };

    // Validate professional information arrays
    const arrayValidations = [
      { data: values.academicQualifications, name: 'academic qualifications', required: ['degree', 'institution', 'yearOfPassing'] },
      { data: values.researchPublications, name: 'research publications', required: ['title'] },
      { data: values.seminars, name: 'seminars', required: ['title'] },
      { data: values.projects, name: 'projects', required: ['title'] },
      { data: values.lectures, name: 'lectures', required: ['topic'] },
      { data: values.awardsRecognitions, name: 'awards and recognitions', required: ['title'] },
      { data: values.coursesTaught, name: 'courses taught', required: ['courseName'] },
      { data: values.administrativeResponsibilities, name: 'administrative responsibilities', required: ['role'] },
      { data: values.studentMentoring, name: 'student mentoring', required: ['studentName'] }
    ];

    for (const validation of arrayValidations) {
      const error = validateRequiredArrays(validation.data, validation.name, validation.required);
      if (error) {
        setApiError(error);
        setIsLoading(false);
        setSubmitting(false);
        return;
      }
    }

    // Validate professional memberships (array of strings)
    if (!Array.isArray(values.professionalMemberships) || values.professionalMemberships.length === 0 || 
        !values.professionalMemberships[0] || values.professionalMemberships[0].trim() === '') {
      setApiError('At least one professional membership is required');
      setIsLoading(false);
      setSubmitting(false);
      return;
    }

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

  // Section validation functions (same as AppraisalForm)
  const validatePersonalInformation = (values) => {
    const errors = {};
    const requiredFields = {
      fullName: 'Full name',
      employeeCode: 'Employee code',
      email: 'Email',
      phoneNumber: 'Phone number',
      department: 'Department',
      designation: 'Designation',
      dateOfJoining: 'Date of joining',
      dateOfBirth: 'Date of birth',
      address: 'Address'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!values[field] || values[field].toString().trim() === '') {
        errors[field] = `${label} is required`;
      }
    }

    // Email format validation
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Please provide a valid email address';
    }

    return errors;
  };

  const validateProfessionalInformation = (values) => {
    const errors = {};

    // Validate arrays with required first entries
    const arrayValidations = [
      { field: 'academicQualifications', name: 'Academic Qualifications', required: ['degree', 'institution', 'yearOfPassing'] },
      { field: 'researchPublications', name: 'Research Publications', required: ['title'] },
      { field: 'seminars', name: 'Seminars', required: ['title'] },
      { field: 'projects', name: 'Projects', required: ['title'] },
      { field: 'lectures', name: 'Lectures', required: ['topic'] },
      { field: 'awardsRecognitions', name: 'Awards & Recognition', required: ['title'] },
      { field: 'coursesTaught', name: 'Courses Taught', required: ['courseName'] },
      { field: 'administrativeResponsibilities', name: 'Administrative Responsibilities', required: ['role'] },
      { field: 'studentMentoring', name: 'Student Mentoring', required: ['studentName'] }
    ];

    for (const validation of arrayValidations) {
      const data = values[validation.field];
      if (!Array.isArray(data) || data.length === 0) {
        errors[validation.field] = `At least one ${validation.name} entry is required`;
        continue;
      }

      const firstEntry = data[0];
      for (const requiredField of validation.required) {
        if (!firstEntry[requiredField] || firstEntry[requiredField].toString().trim() === '') {
          errors[validation.field] = `${validation.name}: ${requiredField} is required in the first entry`;
          break;
        }
      }
    }

    // Validate professional memberships (array of strings)
    if (!Array.isArray(values.professionalMemberships) || values.professionalMemberships.length === 0 || 
        !values.professionalMemberships[0] || values.professionalMemberships[0].trim() === '') {
      errors.professionalMemberships = 'At least one professional membership is required';
    }

    return errors;
  };

  const validateCurrentSection = (values) => {
    let errors = {};
    
    switch (currentSection) {
      case 0: // Personal Information
        errors = validatePersonalInformation(values);
        break;
      case 1: // Professional Information
        errors = validateProfessionalInformation(values);
        break;
      case 2: // File Upload (optional section)
        // No required validation for file upload
        break;
      default:
        break;
    }

    setSectionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextSection = (formikProps) => {
    const isValid = validateCurrentSection(formikProps.values);
    
    if (!isValid) {
      setApiError('Please fill all required fields before proceeding to the next section.');
      return;
    }

    setApiError(''); // Clear any previous errors
    
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    setApiError(''); // Clear errors when going back
    setSectionErrors({});
    
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
                <CurrentSectionComponent 
                  formikProps={formikProps} 
                  sectionErrors={sectionErrors}
                />

                {/* Show section-specific errors */}
                {Object.keys(sectionErrors).length > 0 && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6 text-sm sm:text-base">
                    <p className="font-semibold mb-2">Please fix the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.values(sectionErrors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

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
                        onClick={() => nextSection(formikProps)}
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
