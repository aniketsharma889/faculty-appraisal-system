import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import PersonalInformationSection from "./sections/PersonalInformationSection";
import ProfessionalInformationSection from "./sections/ProfessionalInformationSection";
import FileUploadSection from "./sections/FileUploadSection";
import Button from "../ui/Button";
import { submitAppraisal } from "../../utils/api";

const AppraisalSchema = Yup.object().shape({
  // Personal Information
  fullName: Yup.string().required("Full name is required"),
  employeeCode: Yup.string().required("Employee code is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  department: Yup.string().required("Department is required"),
  designation: Yup.string().required("Designation is required"),
  dateOfJoining: Yup.date().required("Date of joining is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
  address: Yup.string().required("Address is required"),
  
  // Professional Information - First entries required
  academicQualifications: Yup.array().of(
    Yup.object().shape({
      degree: Yup.string().required("Degree is required"),
      institution: Yup.string().required("Institution is required"),
      yearOfPassing: Yup.string().required("Year of passing is required")
    })
  ).min(1, "At least one academic qualification is required"),
  
  researchPublications: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Publication title is required")
    })
  ).min(1, "At least one research publication entry is required"),
  
  seminars: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Seminar title is required")
    })
  ).min(1, "At least one seminar entry is required"),
  
  projects: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Project title is required")
    })
  ).min(1, "At least one project entry is required"),
  
  lectures: Yup.array().of(
    Yup.object().shape({
      topic: Yup.string().required("Lecture topic is required")
    })
  ).min(1, "At least one lecture entry is required"),
  
  awardsRecognitions: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Award title is required")
    })
  ).min(1, "At least one award entry is required"),
  
  professionalMemberships: Yup.array().of(
    Yup.string().required("Professional membership is required")
  ).min(1, "At least one professional membership is required"),
  
  coursesTaught: Yup.array().of(
    Yup.object().shape({
      courseName: Yup.string().required("Course name is required")
    })
  ).min(1, "At least one course entry is required"),
  
  administrativeResponsibilities: Yup.array().of(
    Yup.object().shape({
      role: Yup.string().required("Administrative role is required")
    })
  ).min(1, "At least one administrative responsibility entry is required"),
  
  studentMentoring: Yup.array().of(
    Yup.object().shape({
      studentName: Yup.string().required("Student name is required")
    })
  ).min(1, "At least one student mentoring entry is required")
});

const AppraisalForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const [initialValues, setInitialValues] = useState(null);
  const [sectionErrors, setSectionErrors] = useState({});
  const navigate = useNavigate();

  const sections = [
    { title: "Personal Information", component: PersonalInformationSection },
    { title: "Professional Information", component: ProfessionalInformationSection },
    { title: "File Upload", component: FileUploadSection }
  ];

  useEffect(() => {
    // Pre-fill user data from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    const baseValues = {
      // Personal Information
      fullName: user.name || "",
      employeeCode: "",
      email: user.email || "",
      phoneNumber: "",
      department: user.department || "",
      designation: "",
      dateOfJoining: "",
      dateOfBirth: "",
      address: "",

      // Professional Information
      academicQualifications: [{ degree: "", institution: "", yearOfPassing: "" }],
      researchPublications: [{ title: "", journal: "", year: "" }],
      seminars: [{ title: "", date: "", venue: "" }],
      projects: [{ title: "", description: "", year: "" }],
      lectures: [{ topic: "", date: "" }],
      awardsRecognitions: [{ title: "", year: "", organization: "" }],
      professionalMemberships: [""],
      coursesTaught: [{ courseName: "", semester: "" }],
      administrativeResponsibilities: [{ role: "", duration: "" }],
      studentMentoring: [{ studentName: "", year: "", projectTitle: "" }],

      // File Upload
      uploadedFiles: []
    };

    setInitialValues(baseValues);
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setApiError("");

    // Additional frontend validation to prevent empty submissions
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
      await submitAppraisal(values);
      navigate("/faculty/dashboard", { 
        state: { message: "Appraisal submitted successfully!" }
      });
    } catch (error) {
      setApiError(error.message || "Failed to submit appraisal");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // Section validation functions
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

  // Show loading while initial values are being set
  if (!initialValues) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center items-center h-32">
            <div className="text-lg">Loading form...</div>
          </div>
        </div>
      </div>
    );
  }

  const CurrentSectionComponent = sections[currentSection].component;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Faculty Appraisal Form</h1>
          
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
            enableReinitialize={false}
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
                        {isLoading ? "Submitting..." : "Submit Appraisal"}
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

export default AppraisalForm;
