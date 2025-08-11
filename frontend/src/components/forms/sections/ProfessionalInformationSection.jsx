import { FieldArray } from "formik";
import Button from "../../ui/Button";
import InputField from "../../ui/ImputField";

// Move ArraySection outside to prevent re-creation on each render
const ArraySection = ({ name, title, fields, addButtonText, values, setFieldValue }) => (
  <div className="mb-8">
    <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
    <FieldArray name={name}>
      {({ push, remove }) => (
        <div className="space-y-4">
          {values[name]?.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
                <span className="font-medium text-gray-700">Entry {index + 1}</span>
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  variant="danger"
                  className="text-sm w-full sm:w-auto"
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.name}>
                    <input
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={item[field.name] || ""}
                      onChange={(e) => {
                        const updatedArray = [...values[name]];
                        updatedArray[index] = { ...item, [field.name]: e.target.value };
                        setFieldValue(name, updatedArray);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => push(fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}))}
            variant="secondary"
            className="w-full"
          >
            {addButtonText}
          </Button>
        </div>
      )}
    </FieldArray>
  </div>
);

const ProfessionalInformationSection = ({ formikProps }) => {
  const { values, setFieldValue } = formikProps;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Information</h2>

      <ArraySection
        name="academicQualifications"
        title="Academic Qualifications"
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
        fields={[
          { name: "title", placeholder: "Award Title" },
          { name: "year", placeholder: "Year", type: "number" },
          { name: "organization", placeholder: "Awarding Organization" }
        ]}
        addButtonText="Add Award/Recognition"
        values={values}
        setFieldValue={setFieldValue}
      />

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Professional Memberships</h3>
        <FieldArray name="professionalMemberships">
          {({ push, remove }) => (
            <div className="space-y-2">
              {values.professionalMemberships?.map((membership, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="Professional Membership (e.g., IEEE, ACM)"
                    value={membership}
                    onChange={(e) => {
                      const updated = [...values.professionalMemberships];
                      updated[index] = e.target.value;
                      setFieldValue('professionalMemberships', updated);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    variant="danger"
                    className="text-sm w-full sm:w-auto"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => push("")}
                variant="secondary"
                className="w-full"
              >
                Add Professional Membership
              </Button>
            </div>
          )}
        </FieldArray>
      </div>

      <ArraySection
        name="coursesTaught"
        title="Courses Taught"
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
