import { Field, ErrorMessage } from "formik";
import InputField from "../../ui/ImputField";
import { User, Mail, Building2, Calendar, IdCard, Phone, Award } from "lucide-react";

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
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Head of Department",
  "Dean",
  "Research Scholar",
  "Lab Assistant",
  "Visiting Faculty"
];

const PersonalInformationSection = ({ formikProps }) => {
  return (
    <div className="mb-6 sm:mb-8 lg:mb-10">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
        <div className="flex items-center space-x-4 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/70 backdrop-blur rounded-lg flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">Personal Information</h2>
            <p className="text-xs sm:text-sm text-gray-600">Please fill in your personal details accurately</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center">
              <User className="w-4 h-4 mr-1 text-indigo-400" />
              Full Name
            </label>
            <Field name="fullName" placeholder="Full Name" as={InputField} />
            <ErrorMessage name="fullName" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center">
              <IdCard className="w-4 h-4 mr-1 text-indigo-400" />
              Employee Code
            </label>
            <Field name="employeeCode" placeholder="Employee Code" as={InputField} />
            <ErrorMessage name="employeeCode" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Mail className="w-4 h-4 mr-1 text-indigo-400" />
              Email Address
            </label>
            <Field name="email" type="email" placeholder="Email Address" as={InputField} />
            <ErrorMessage name="email" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Phone className="w-4 h-4 mr-1 text-indigo-400" />
              Phone Number
            </label>
            <Field name="phoneNumber" placeholder="Phone Number" as={InputField} />
            <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Building2 className="w-4 h-4 mr-1 text-indigo-400" />
              Department
            </label>
            <Field name="department">
              {({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base bg-gray-50"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              )}
            </Field>
            <ErrorMessage name="department" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Award className="w-4 h-4 mr-1 text-indigo-400" />
              Designation
            </label>
            <Field name="designation">
              {({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base bg-gray-50"
                >
                  <option value="">Select Designation</option>
                  {designations.map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              )}
            </Field>
            <ErrorMessage name="designation" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-indigo-400" />
              Date of Joining
            </label>
            <Field name="dateOfJoining" type="date" as={InputField} />
            <ErrorMessage name="dateOfJoining" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-indigo-400" />
              Date of Birth
            </label>
            <Field name="dateOfBirth" type="date" as={InputField} />
            <ErrorMessage name="dateOfBirth" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Complete Address</label>
          <Field name="address">
            {({ field }) => (
              <textarea
                {...field}
                placeholder="Complete Address"
                rows={3}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base bg-gray-50"
              />
            )}
          </Field>
          <ErrorMessage name="address" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
        </div>
      </div>
    </div>
  );
};

export default PersonalInformationSection;