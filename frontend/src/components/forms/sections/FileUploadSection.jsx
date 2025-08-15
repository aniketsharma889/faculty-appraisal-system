import { useState } from "react";
import { FieldArray } from "formik";
import Button from "../../ui/Button";

const FileUploadSection = ({ formikProps }) => {
  const { values, setFieldValue } = formikProps;
  const [uploadingFiles, setUploadingFiles] = useState({});

  const handleFileUpload = async (file, index) => {
    setUploadingFiles(prev => ({ ...prev, [index]: true }));
    
    try {
      // Store the actual file object for multer
      const fileInfo = {
        fileName: file.name,
        file: file, // Store actual file object
        uploadedAt: new Date().toISOString()
      };

      const updatedFiles = [...values.uploadedFiles];
      updatedFiles[index] = { ...updatedFiles[index], ...fileInfo };
      setFieldValue('uploadedFiles', updatedFiles);
      
    } catch (error) {
      console.error('File preparation failed:', error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [index]: false }));
    }
  };

  const fileTypes = [
    "CV/Resume",
    "Educational Certificates",
    "Experience Letters",
    "Research Publications",
    "Award Certificates",
    "Project Reports",
    "Other Documents"
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Document Upload</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Upload Guidelines:</h3>
        <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
          <li>• Supported formats: PDF, JPG, PNG</li>
          <li>• Maximum file size: 10MB per file</li>
          <li>• Please ensure all documents are clear and legible</li>
          <li>• Upload documents in the order of relevance</li>
        </ul>
      </div>

      <FieldArray name="uploadedFiles">
        {({ push, remove }) => (
          <div className="space-y-3 sm:space-y-4">
            {values.uploadedFiles.length === 0 && (
              <div className="text-center py-6 sm:py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 text-sm sm:text-base">No files uploaded yet. Click "Add File" to start.</p>
              </div>
            )}

            {values.uploadedFiles.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                  <h4 className="font-medium text-gray-800 text-sm sm:text-base">Document {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    variant="danger"
                    className="text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Document Type
                    </label>
                    <select
                      value={file.documentType || ""}
                      onChange={(e) => {
                        const updatedFiles = [...values.uploadedFiles];
                        updatedFiles[index] = { ...file, documentType: e.target.value };
                        setFieldValue('uploadedFiles', updatedFiles);
                      }}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    >
                      <option value="">Select document type</option>
                      {fileTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Upload File
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      onChange={(e) => {
                        const selectedFile = e.target.files[0];
                        if (selectedFile) {
                          handleFileUpload(selectedFile, index);
                        }
                      }}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {uploadingFiles[index] && (
                  <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full animate-pulse w-1/2"></div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Preparing file...</p>
                  </div>
                )}

                {(file.fileName || file.fileUrl) && (
                  <div className="mt-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-green-800">{file.fileName}</p>
                        <p className="text-xs text-green-600">
                          {file.uploadedAt ? `Uploaded: ${new Date(file.uploadedAt).toLocaleString()}` : 'Ready to upload'}
                        </p>
                      </div>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={file.description || ""}
                    onChange={(e) => {
                      const updatedFiles = [...values.uploadedFiles];
                      updatedFiles[index] = { ...file, description: e.target.value };
                      setFieldValue('uploadedFiles', updatedFiles);
                    }}
                    placeholder="Brief description of the document"
                    rows={2}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={() => push({ fileName: "", fileUrl: "", documentType: "", description: "" })}
              variant="secondary"
              className="w-full text-xs sm:text-sm"
            >
              Add File
            </Button>
          </div>
        )}
      </FieldArray>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs sm:text-sm text-yellow-800">
          <strong>Note:</strong> Please review all information and uploaded documents before submitting. 
          Once submitted, the appraisal will be sent for review and approval.
        </p>
      </div>
    </div>
  );
};


export default FileUploadSection;
