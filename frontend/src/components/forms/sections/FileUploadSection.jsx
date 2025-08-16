import { useState } from "react";
import { Upload, FileText, Download, Trash2, AlertCircle, CheckCircle, File, Image, Video, Archive } from "lucide-react";

const FileUploadSection = ({ formikProps = {} }) => {
  const { values, setFieldValue } = formikProps;
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (files) => {
    const fileArray = Array.from(files);
    const newFiles = fileArray.map(file => ({
      file: file,
      fileName: file.name,
      uploadedAt: new Date().toISOString()
    }));
    
    const updatedFiles = [...(values.uploadedFiles || []), ...newFiles];
    setFieldValue('uploadedFiles', updatedFiles);
  };

  const removeFile = (index) => {
    const currentPosition = window.pageYOffset;
    const updatedFiles = values.uploadedFiles.filter((_, i) => i !== index);
    setFieldValue('uploadedFiles', updatedFiles);
    setTimeout(() => {
      window.scrollTo({ top: currentPosition, behavior: 'instant' });
    }, 0);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (['mp4', 'avi', 'mov', 'wmv', 'mkv'].includes(extension)) {
      return <Video className="w-5 h-5 text-purple-500" />;
    } else if (['zip', 'rar', '7z', 'tar'].includes(extension)) {
      return <Archive className="w-5 h-5 text-orange-500" />;
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadedFiles = values.uploadedFiles || [];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Upload className="w-6 h-6 mr-3 text-indigo-600" />
          Supporting Documents
        </h2>
        <p className="text-gray-600 mt-2">
          Upload supporting documents for your appraisal. This section is optional but recommended for comprehensive evaluation.
        </p>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
            <AlertCircle className="w-3 h-3 text-white" />
          </div>
          <div>
            <h4 className="text-blue-900 font-semibold text-sm mb-2">Upload Guidelines</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Supported formats: PDF, DOC, DOCX, JPG, PNG, ZIP</li>
              <li>• Maximum file size: 10MB per file</li>
              <li>• You can upload multiple files</li>
              <li>• Files should be relevant to your appraisal (certificates, publications, etc.)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <Upload className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Upload Files</h3>
            <p className="text-sm text-gray-600 mt-1">Drag and drop files or click to browse</p>
          </div>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar"
          />
          
          <div className="space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              dragActive ? 'bg-indigo-100' : 'bg-gray-100'
            }`}>
              <Upload className={`w-8 h-8 ${dragActive ? 'text-indigo-600' : 'text-gray-400'}`} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {dragActive ? 'Drop files here' : 'Choose files to upload'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop files here, or{' '}
                <span className="text-indigo-600 font-medium">click to browse</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Uploaded Files</h3>
                <p className="text-sm text-gray-600">
                  {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((fileObj, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0 mr-3">
                      {getFileIcon(fileObj.fileName)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {fileObj.fileName}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {fileObj.file && (
                          <span className="text-xs text-gray-500">
                            {formatFileSize(fileObj.file.size)}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {fileObj.uploadedAt ? 
                            `Added ${new Date(fileObj.uploadedAt).toLocaleDateString()}` :
                            'Previously uploaded'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {fileObj.fileUrl && (
                      <a
                        href={fileObj.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        View
                      </a>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Types Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Recommended Documents to Upload:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2 text-red-500" />
              Academic certificates and transcripts
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2 text-red-500" />
              Research publications (PDF copies)
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2 text-red-500" />
              Award certificates
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2 text-red-500" />
              Conference participation certificates
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2 text-red-500" />
              Professional membership certificates
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2 text-red-500" />
              Any other supporting documents
            </div>
          </div>
        </div>
      </div>

      {/* Final Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
          <div>
            <h4 className="text-green-900 font-semibold text-sm">Optional Section</h4>
            <p className="text-green-800 text-sm mt-1">
              While file uploads are optional, providing supporting documents can strengthen your appraisal 
              and provide additional context for reviewers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadSection;
