import { Plus, Minus, GraduationCap, BookOpen, Users, Award, Briefcase, Building, UserCheck, Calendar, MapPin, FileText } from "lucide-react";

const ProfessionalInformationSection = ({ formikProps, sectionErrors = {} }) => {
  const { values, setFieldValue } = formikProps;

  // Enhanced reusable component for array fields with better styling
  const ArrayFieldSection = ({ 
    title, 
    fieldName, 
    items, 
    renderFields, 
    icon: Icon,
    description,
    minItems = 1,
    gradient = "from-indigo-50 to-purple-50",
    borderColor = "border-indigo-200"
  }) => {
    const hasError = sectionErrors[fieldName];
    
    const addItem = () => {
      const newItem = renderFields()[0];
      const newItems = [...items, newItem];
      setFieldValue(fieldName, newItems);
      
      // Prevent page jump by using setTimeout to scroll after DOM update
      setTimeout(() => {
        const currentPosition = window.pageYOffset;
        window.scrollTo({ top: currentPosition, behavior: 'instant' });
      }, 0);
    };

    const removeItem = (index) => {
      if (items.length > minItems) {
        const newItems = items.filter((_, i) => i !== index);
        setFieldValue(fieldName, newItems);
      }
    };

    const updateItem = (index, field, value) => {
      const newItems = [...items];
      if (typeof newItems[index] === 'string') {
        newItems[index] = value;
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      setFieldValue(fieldName, newItems);
    };

    return (
      <div className={`bg-gradient-to-r ${gradient} rounded-xl p-6 border ${borderColor} ${hasError ? 'border-red-300 bg-red-50' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${hasError ? 'bg-red-100' : 'bg-white shadow-sm'}`}>
              <Icon className={`w-5 h-5 ${hasError ? 'text-red-600' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${hasError ? 'text-red-900' : 'text-gray-800'}`}>
                {title} <span className="text-red-500">*</span>
              </h3>
              {description && (
                <p className={`text-sm mt-1 ${hasError ? 'text-red-700' : 'text-gray-600'}`}>{description}</p>
              )}
            </div>
          </div>
        </div>

        {hasError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm font-medium">{hasError}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className={`bg-white rounded-lg p-4 border ${hasError && index === 0 ? 'border-red-300' : 'border-gray-200'} shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Entry {index + 1} {index === 0 && <span className="text-red-500 text-xs">(Required)</span>}
                </span>
                {items.length > minItems && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-50"
                    title="Remove entry"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
              {renderFields(item, index, updateItem)}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-4 w-full bg-white border-2 border-dashed border-indigo-300 rounded-lg py-3 px-4 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Entry
        </button>
      </div>
    );
  };

  // Enhanced input component with better styling
  const FormInput = ({ 
    label, 
    value, 
    onChange, 
    type = "text", 
    placeholder, 
    required = false,
    className = "",
    icon: Icon = null
  }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-1 text-gray-500" />}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-400"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Briefcase className="w-6 h-6 mr-3 text-indigo-600" />
          Professional Information
        </h2>
        <p className="text-gray-600 mt-2">
          Please provide detailed information about your academic and professional background. All sections marked with 
          <span className="text-red-500 font-semibold"> * </span> 
          require at least one entry with complete information.
        </p>
      </div>

      {/* Academic Qualifications */}
      <ArrayFieldSection
        title="Academic Qualifications"
        fieldName="academicQualifications"
        items={values.academicQualifications}
        icon={GraduationCap}
        description="List your educational qualifications starting from the highest degree"
        gradient="from-blue-50 to-indigo-50"
        borderColor="border-blue-200"
        renderFields={(item = {}, index, updateItem) => (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Degree"
              value={item.degree || ''}
              onChange={(e) => updateItem(index, 'degree', e.target.value)}
              placeholder="e.g., M.Tech, Ph.D."
              required={index === 0}
              icon={GraduationCap}
            />
            <FormInput
              label="Institution"
              value={item.institution || ''}
              onChange={(e) => updateItem(index, 'institution', e.target.value)}
              placeholder="e.g., IIT Delhi"
              required={index === 0}
              icon={Building}
            />
            <FormInput
              label="Year of Passing"
              value={item.yearOfPassing || ''}
              onChange={(e) => updateItem(index, 'yearOfPassing', e.target.value)}
              placeholder="e.g., 2020"
              required={index === 0}
              icon={Calendar}
            />
          </div>
        )}
      />

      {/* Research Publications */}
      <ArrayFieldSection
        title="Research Publications"
        fieldName="researchPublications"
        items={values.researchPublications}
        icon={BookOpen}
        description="List your published research papers, articles, and publications"
        gradient="from-green-50 to-emerald-50"
        borderColor="border-green-200"
        renderFields={(item = {}, index, updateItem) => (
          <div className="space-y-4">
            <FormInput
              label="Publication Title"
              value={item.title || ''}
              onChange={(e) => updateItem(index, 'title', e.target.value)}
              placeholder="Enter the complete title of your publication"
              required={index === 0}
              icon={BookOpen}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Journal/Conference Name"
                value={item.journal || ''}
                onChange={(e) => updateItem(index, 'journal', e.target.value)}
                placeholder="e.g., IEEE Transactions"
                icon={FileText}
              />
              <FormInput
                label="Publication Year"
                value={item.year || ''}
                onChange={(e) => updateItem(index, 'year', e.target.value)}
                placeholder="e.g., 2023"
                icon={Calendar}
              />
            </div>
          </div>
        )}
      />

      {/* Seminars & Workshops */}
      <ArrayFieldSection
        title="Seminars & Workshops"
        fieldName="seminars"
        items={values.seminars}
        icon={Users}
        description="List seminars and workshops you have attended or organized"
        gradient="from-purple-50 to-pink-50"
        borderColor="border-purple-200"
        renderFields={(item = {}, index, updateItem) => (
          <div className="space-y-4">
            <FormInput
              label="Seminar/Workshop Title"
              value={item.title || ''}
              onChange={(e) => updateItem(index, 'title', e.target.value)}
              placeholder="Enter the title of the seminar/workshop"
              required={index === 0}
              icon={Users}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Venue"
                value={item.venue || ''}
                onChange={(e) => updateItem(index, 'venue', e.target.value)}
                placeholder="e.g., IIT Delhi"
                icon={MapPin}
              />
              <FormInput
                label="Date"
                type="date"
                value={item.date || ''}
                onChange={(e) => updateItem(index, 'date', e.target.value)}
                icon={Calendar}
              />
            </div>
          </div>
        )}
      />

      {/* Research Projects */}
      <ArrayFieldSection
        title="Research Projects"
        fieldName="projects"
        items={values.projects}
        icon={Briefcase}
        description="List your research projects and their details"
        gradient="from-orange-50 to-red-50"
        borderColor="border-orange-200"
        renderFields={(item = {}, index, updateItem) => (
          <div className="space-y-4">
            <FormInput
              label="Project Title"
              value={item.title || ''}
              onChange={(e) => updateItem(index, 'title', e.target.value)}
              placeholder="Enter the project title"
              required={index === 0}
              icon={Briefcase}
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <FormInput
                  label="Project Description"
                  value={item.description || ''}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Brief description of the project"
                  icon={FileText}
                />
              </div>
              <FormInput
                label="Year"
                value={item.year || ''}
                onChange={(e) => updateItem(index, 'year', e.target.value)}
                placeholder="e.g., 2023"
                icon={Calendar}
              />
            </div>
          </div>
        )}
      />

      {/* Guest Lectures */}
      <ArrayFieldSection
        title="Guest Lectures"
        fieldName="lectures"
        items={values.lectures}
        icon={GraduationCap}
        description="List guest lectures you have delivered"
        gradient="from-teal-50 to-cyan-50"
        borderColor="border-teal-200"
        renderFields={(item = {}, index, updateItem) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Lecture Topic"
              value={item.topic || ''}
              onChange={(e) => updateItem(index, 'topic', e.target.value)}
              placeholder="Enter the lecture topic"
              required={index === 0}
              icon={GraduationCap}
            />
            <FormInput
              label="Date"
              type="date"
              value={item.date || ''}
              onChange={(e) => updateItem(index, 'date', e.target.value)}
              icon={Calendar}
            />
          </div>
        )}
      />

      {/* Awards & Recognition */}
      <ArrayFieldSection
        title="Awards & Recognition"
        fieldName="awardsRecognitions"
        items={values.awardsRecognitions}
        icon={Award}
        description="List awards and recognition you have received"
        gradient="from-yellow-50 to-orange-50"
        borderColor="border-yellow-200"
        renderFields={(item = {}, index, updateItem) => (
          <div className="space-y-4">
            <FormInput
              label="Award Title"
              value={item.title || ''}
              onChange={(e) => updateItem(index, 'title', e.target.value)}
              placeholder="Enter the award title"
              required={index === 0}
              icon={Award}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Awarding Organization"
                value={item.organization || ''}
                onChange={(e) => updateItem(index, 'organization', e.target.value)}
                placeholder="e.g., IEEE, ACM"
                icon={Building}
              />
              <FormInput
                label="Year"
                value={item.year || ''}
                onChange={(e) => updateItem(index, 'year', e.target.value)}
                placeholder="e.g., 2023"
                icon={Calendar}
              />
            </div>
          </div>
        )}
      />

      {/* Professional Memberships */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Professional Memberships <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">List your professional society memberships</p>
          </div>
        </div>

        {sectionErrors.professionalMemberships && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm font-medium">{sectionErrors.professionalMemberships}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {values.professionalMemberships.map((membership, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Membership {index + 1} {index === 0 && <span className="text-red-500 text-xs">(Required)</span>}
                </span>
                {values.professionalMemberships.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newMemberships = values.professionalMemberships.filter((_, i) => i !== index);
                      setFieldValue('professionalMemberships', newMemberships);
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={membership}
                onChange={(e) => {
                  const newMemberships = [...values.professionalMemberships];
                  newMemberships[index] = e.target.value;
                  setFieldValue('professionalMemberships', newMemberships);
                }}
                placeholder="e.g., IEEE Computer Society"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-400"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            const currentPosition = window.pageYOffset;
            setFieldValue('professionalMemberships', [...values.professionalMemberships, '']);
            setTimeout(() => {
              window.scrollTo({ top: currentPosition, behavior: 'instant' });
            }, 0);
          }}
          className="mt-4 w-full bg-white border-2 border-dashed border-indigo-300 rounded-lg py-3 px-4 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Membership
        </button>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="text-blue-900 font-semibold text-sm">Completion Guidelines</h4>
            <p className="text-blue-800 text-sm mt-1">
              Each section requires at least one complete entry. You can add multiple entries for comprehensive documentation. 
              Required fields in the first entry of each section must be filled to proceed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInformationSection;
