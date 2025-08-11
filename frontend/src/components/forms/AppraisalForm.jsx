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
});

const AppraisalForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const [initialValues, setInitialValues] = useState(null);
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
