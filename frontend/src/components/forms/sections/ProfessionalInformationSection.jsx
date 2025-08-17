import { FieldArray } from "formik";
import Button from "../../ui/Button";
import InputField from "../../ui/ImputField";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Briefcase, 
  Mic, 
  Award, 
  Star, 
  Book, 
  Building, 
  UserCheck,
  Plus,
  Info
} from "lucide-react";

// Enhanced ArraySection with better UI and responsiveness
const ArraySection = ({ name, title, fields, addButtonText, values, setFieldValue, icon: Icon, color = "indigo", }) => {
  // Ensure at least one entry exists
  const entries = values[name] || [fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})];
  
  const colorClasses = {
    indigo: "from-indigo-50 to-blue-50 border-indigo-200 text-indigo-700",
    green: "from-green-50 to-emerald-50 border-green-200 text-green-700",
    purple: "from-purple-50 to-indigo-50 border-purple-200 text-purple-700",
    orange: "from-orange-50 to-amber-50 border-orange-200 text-orange-700",
    pink: "from-pink-50 to-rose-50 border-pink-200 text-pink-700",
    teal: "from-teal-50 to-cyan-50 border-teal-200 text-teal-700"
  };
  
  return (
    <div className="mb-6 sm:mb-8 lg:mb-10">
      <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border`}>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/70 backdrop-blur rounded-lg flex items-center justify-center shadow-sm mx-auto sm:mx-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 ml-5">{title}</h3>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 ml-5" />
              <span className="text-xs sm:text-sm text-gray-600 ">Write "None" if not applicable</span>
            </div>
          </div>
        </div>
      </div>
      
      <FieldArray name={name}>
        {({ push }) => (
          <div className="space-y-4 sm:space-y-6">
            {entries.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center shadow-sm`}>
                      <span className="text-white font-bold text-xs sm:text-sm">{index + 1}</span>
                    </div>
                    <span className="font-semibold text-gray-800 text-base sm:text-lg">Entry {index + 1}</span>
                  </div>
                  <div className={`px-2 sm:px-3 py-1 bg-${color}-100 text-${color}-700 rounded-full text-xs font-medium self-start sm:self-auto`}>
                    {fields.length} field{fields.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
                  {fields.map((field, fieldIndex) => (
                    <div key={field.name} className={`${
                      fields.length === 1 || 
                      (fieldIndex === fields.length - 1 && fields.length % 2 !== 0) || 
                      fields.length === 2 && fieldIndex === 1
                        ? 'sm:col-span-2' : ''
                    }`}>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 capitalize">
                        {field.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <input
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        value={item[field.name] || ""}
                        onChange={(e) => {
                          const updatedArray = [...entries];
                          updatedArray[index] = { ...item, [field.name]: e.target.value };
                          setFieldValue(name, updatedArray);
                        }}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="text-center">
              <Button
                type="button"
                onClick={() => {
                  const newEntry = fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {});
                  setFieldValue(name, [...entries, newEntry]);
                }}
                variant="secondary"
                className="w-full sm:max-w-md bg-gradient-to-r from-gray-50 to-white border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 py-3 sm:py-4 text-gray-600 hover:text-indigo-700 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">{addButtonText}</span>
                <span className="sm:hidden">Add {title.split(' ')[0]}</span>
              </Button>
            </div>
          </div>
        )}
      </FieldArray>
    </div>
  );
};

const ProfessionalInformationSection = ({ formikProps }) => {
  const { values, setFieldValue } = formikProps;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white mb-6 sm:mb-10">
        <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Professional Information</h2>
        <p className="text-indigo-100 text-sm sm:text-lg">Showcase your academic and professional achievements</p>
      </div>

      <ArraySection
        name="academicQualifications"
        title="Academic Qualifications"
        icon={GraduationCap}
        color="indigo"
        fields={[
          { name: "degree", placeholder: "Degree (e.g., M.Tech, PhD)" },
          { name: "institution", placeholder: "Institution Name" },
          { name: "yearOfPassing", placeholder: "Year of Passing", type: "number" }
        ]}
        addButtonText="Add Academic Qualification"
        values={values}
        setFieldValue={setFieldValue}
      />

      <ArraySection
        name="researchPublications"
        title="Research Publications"
        icon={BookOpen}
        color="green"
        fields={[
          { name: "title", placeholder: "Publication Title" },
          { name: "journal", placeholder: "Journal/Conference Name" },
          { name: "year", placeholder: "Publication Year", type: "number" }
        ]}
        addButtonText="Add Research Publication"
        values={values}
        setFieldValue={setFieldValue}
      />

      <ArraySection
        name="seminars"
        title="Seminars/Workshops Attended"
        icon={Users}
        color="purple"
        fields={[
          { name: "title", placeholder: "Seminar/Workshop Title" },
          { name: "date", placeholder: "Date", type: "date" },
          { name: "venue", placeholder: "Venue/Platform" }
        ]}
        addButtonText="Add Seminar/Workshop"
        values={values}
        setFieldValue={setFieldValue}
      />

      <ArraySection
        name="projects"
        title="Projects Undertaken"
        icon={Briefcase}
        color="orange"
        fields={[
          { name: "title", placeholder: "Project Title" },
          { name: "description", placeholder: "Project Description" },
          { name: "year", placeholder: "Year", type: "number" }
        ]}
        addButtonText="Add Project"
        values={values}
        setFieldValue={setFieldValue}
      />

      <ArraySection
        name="lectures"
        title="Guest Lectures/Talks"
        icon={Mic}
        color="pink"
        fields={[
          { name: "topic", placeholder: "Lecture Topic" },
          { name: "date", placeholder: "Date", type: "date" }
        ]}
        addButtonText="Add Lecture/Talk"
        values={values}
        setFieldValue={setFieldValue}
      />

      <ArraySection
        name="awardsRecognitions"
        title="Awards & Recognitions"
        icon={Award}
        color="orange"
        fields={[
          { name: "title", placeholder: "Award Title" },
          { name: "year", placeholder: "Year", type: "number" },
          { name: "organization", placeholder: "Awarding Organization" }
        ]}
        addButtonText="Add Award/Recognition"
        values={values}
        setFieldValue={setFieldValue}
      />

      <ArraySection
        name="professionalMemberships"
        title="Professional Memberships"
        icon={Star}
        color="teal"
        fields={[
          { name: "membership", placeholder: "Professional Membership (e.g., IEEE, ACM) or write 'None'" }
        ]}
        addButtonText="Add Professional Membership"
        values={{
          ...values,
          professionalMemberships: (values.professionalMemberships && values.professionalMemberships.length > 0)
            ? values.professionalMemberships.map(m => typeof m === "string" ? { membership: m } : m)
            : [{ membership: "" }]
        }}
        setFieldValue={(name, arr) => {
          // flatten to array of strings for formik
          setFieldValue(name, arr.map(obj => obj.membership));
        }}
      />

      <ArraySection
        name="coursesTaught"
        title="Courses Taught"
        icon={Book}
        color="indigo"
        fields={[
          { name: "courseName", placeholder: "Course Name" },
          { name: "semester", placeholder: "Semester/Year" }
        ]}
        addButtonText="Add Course"
        values={values}
        setFieldValue={setFieldValue}
      />

      <ArraySection
        name="administrativeResponsibilities"
        title="Administrative Responsibilities"
        icon={Building}
        color="purple"
        fields={[
          { name: "role", placeholder: "Administrative Role" },
          { name: "duration", placeholder: "Duration (e.g., 2021-2023)" }
        ]}
        addButtonText="Add Administrative Role"
        values={values}
        setFieldValue={setFieldValue}
      />

      <ArraySection
        name="studentMentoring"
        title="Student Mentoring/Guidance"
        icon={UserCheck}
        color="green"
        fields={[
          { name: "studentName", placeholder: "Student Name" },
          { name: "year", placeholder: "Year", type: "number" },
          { name: "projectTitle", placeholder: "Project/Thesis Title" }
        ]}
        addButtonText="Add Student Mentoring"
        values={values}
        setFieldValue={setFieldValue} 
      />
    </div>
  );
};

export default ProfessionalInformationSection;