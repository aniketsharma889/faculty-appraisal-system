import { Field, ErrorMessage } from "formik";
import InputField from "../../ui/ImputField";

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

const PersonalInformationSection = ({ formikProps }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Personal Information</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Field name="fullName" placeholder="Full Name" as={InputField} />
          <ErrorMessage name="fullName" component="div" className="text-red-500 text-xs sm:text-sm" />
        </div>

        <div>
          <Field name="employeeCode" placeholder="Employee Code" as={InputField} />
          <ErrorMessage name="employeeCode" component="div" className="text-red-500 text-xs sm:text-sm" />
        </div>

        <div>
          <Field name="email" type="email" placeholder="Email Address" as={InputField} />
          <ErrorMessage name="email" component="div" className="text-red-500 text-xs sm:text-sm" />
        </div>

        <div>
          <Field name="phoneNumber" placeholder="Phone Number" as={InputField} />
          <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-xs sm:text-sm" />
        </div>

        <div>
          <Field name="department">
            {({ field }) => (
              <select
                {...field}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}
          </Field>
          <ErrorMessage name="department" component="div" className="text-red-500 text-xs sm:text-sm" />
        </div>

        <div>
          <Field name="designation" placeholder="Designation" as={InputField} />
          <ErrorMessage name="designation" component="div" className="text-red-500 text-xs sm:text-sm" />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
          <Field name="dateOfJoining" type="date" as={InputField} />
          <ErrorMessage name="dateOfJoining" component="div" className="text-red-500 text-xs sm:text-sm" />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <Field name="dateOfBirth" type="date" as={InputField} />
          <ErrorMessage name="dateOfBirth" component="div" className="text-red-500 text-xs sm:text-sm" />
        </div>
      </div>

      <div>
        <Field name="address">
          {({ field }) => (
            <textarea
              {...field}
              placeholder="Complete Address"
              rows={3}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            />
          )}
        </Field>
        <ErrorMessage name="address" component="div" className="text-red-500 text-xs sm:text-sm" />
      </div>
    </div>
  );
};

export default PersonalInformationSection;
