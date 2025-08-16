import { Field, ErrorMessage } from "formik";
import InputField from "../../ui/ImputField";
import { User, Mail, Phone, Building, Calendar, MapPin, Briefcase } from "lucide-react";

const PersonalInformationSection = ({ formikProps, sectionErrors = {} }) => {
  const { values, errors, touched, handleChange, handleBlur} = formikProps;

  const departments = [
    "Computer Science",
    "Electronics & Communication", 
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Information Technology",
    "Chemical Engineering",
    "Biotechnology",
    "Mathematics",
    "Physics", 
    "Chemistry",
    "English",
    "Management Studies"
  ];

  const designations = [
    "Assistant Professor",
    "Associate Professor", 
    "Professor",
    "Head of Department",
    "Dean",
    "Principal",
    "Lecturer",
    "Senior Lecturer"
  ];

  const FormField = ({ 
    label, 
    name, 
    type = "text", 
    placeholder, 
    required = false, 
    options = null,
    icon: Icon = null,
    className = ""
  }) => {
    const hasError = (errors[name] && touched[name]) || sectionErrors[name];
    const errorMessage = sectionErrors[name] || errors[name];

    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            {Icon && <Icon className="w-4 h-4 mr-2 text-gray-500" />}
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
        </label>
        
        {options ? (
          <select
            name={name}
            value={values[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              hasError
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={values[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              hasError
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder={placeholder}
          />
        )}
        
        {hasError && (
          <div className="flex items-center mt-1">
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center mr-2">
              <span className="text-white text-xs">!</span>
            </div>
            <p className="text-red-600 text-xs font-medium">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <User className="w-6 h-6 mr-3 text-indigo-600" />
          Personal Information
        </h2>
        <p className="text-gray-600 mt-2">
          Please provide your basic personal and contact information. All fields marked with 
          <span className="text-red-500 font-semibold"> * </span> 
          are required.
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-gray-600" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Full Name"
            name="fullName"
            placeholder="Enter your full name"
            required={true}
            icon={User}
          />
          
          <FormField
            label="Employee Code"
            name="employeeCode"
            placeholder="Enter your employee code"
            required={true}
            icon={Briefcase}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-gray-600" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email address"
            required={true}
            icon={Mail}
          />
          
          <FormField
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            required={true}
            icon={Phone}
          />
        </div>
        
        <div className="mt-6">
          <FormField
            label="Address"
            name="address"
            placeholder="Enter your complete address"
            required={true}
            icon={MapPin}
          />
        </div>
      </div>

      {/* Professional Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2 text-gray-600" />
          Professional Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Department"
            name="department"
            placeholder="Select your department"
            required={true}
            options={departments}
            icon={Building}
          />
          
          <FormField
            label="Designation"
            name="designation"
            placeholder="Select your designation"
            required={true}
            options={designations}
            icon={Briefcase}
          />
        </div>
      </div>

      {/* Important Dates */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-gray-600" />
          Important Dates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Date of Joining"
            name="dateOfJoining"
            type="date"
            placeholder="Select date of joining"
            required={true}
            icon={Calendar}
          />
          
          <FormField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            placeholder="Select date of birth"
            required={true}
            icon={Calendar}
          />
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="text-blue-900 font-semibold text-sm">Important Notice</h4>
            <p className="text-blue-800 text-sm mt-1">
              Please ensure all information is accurate and up-to-date. You can review and edit this information 
              before final submission. All fields marked with a red asterisk (*) are mandatory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformationSection;
