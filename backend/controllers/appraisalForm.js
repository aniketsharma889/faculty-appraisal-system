const Appraisal = require('../models/appraisal-form-model');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');

   const cloudinary = require('../config/cloudinaryConfig'); 
   const streamifier = require('streamifier');

async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'faculty-appraisals' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

const submitAppraisal = async (req, res) => {
  try {
    const facultyId = req.user.userId;
    const {
      fullName,
      employeeCode,
      email,
      phoneNumber,
      department,
      designation,
      dateOfJoining,
      dateOfBirth,
      address,
      academicQualifications,
      researchPublications,
      seminars,
      projects,
      lectures,
      awardsRecognitions,
      professionalMemberships,
      coursesTaught,
      administrativeResponsibilities,
      studentMentoring,
      uploadedFiles
    } = req.body;

    // Validate required personal information fields
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
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        return res.status(400).json({ 
          message: `${label} is required and cannot be empty` 
        });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Parse and validate professional information arrays
    const parseAndValidateArray = (data, fieldName, requiredSubFields = []) => {
      let parsed = [];
      try {
        parsed = data ? JSON.parse(data) : [];
      } catch (e) {
        throw new Error(`Invalid format for ${fieldName}`);
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error(`At least one ${fieldName} entry is required`);
      }

      // Check if first entry has required fields filled
      const firstEntry = parsed[0];
      for (const subField of requiredSubFields) {
        if (!firstEntry[subField] || firstEntry[subField].toString().trim() === '') {
          throw new Error(`${fieldName}: ${subField} is required in the first entry`);
        }
      }

      return parsed;
    };

    let parsedAcademicQualifications, parsedResearchPublications, parsedSeminars, 
        parsedProjects, parsedLectures, parsedAwardsRecognitions, parsedProfessionalMemberships,
        parsedCoursesTaught, parsedAdministrativeResponsibilities, parsedStudentMentoring;

    try {
      parsedAcademicQualifications = parseAndValidateArray(academicQualifications, 'academic qualifications', ['degree', 'institution', 'yearOfPassing']);
      parsedResearchPublications = parseAndValidateArray(researchPublications, 'research publications', ['title']);
      parsedSeminars = parseAndValidateArray(seminars, 'seminars', ['title']);
      parsedProjects = parseAndValidateArray(projects, 'projects', ['title']);
      parsedLectures = parseAndValidateArray(lectures, 'lectures', ['topic']);
      parsedAwardsRecognitions = parseAndValidateArray(awardsRecognitions, 'awards and recognitions', ['title']);
      parsedCoursesTaught = parseAndValidateArray(coursesTaught, 'courses taught', ['courseName']);
      parsedAdministrativeResponsibilities = parseAndValidateArray(administrativeResponsibilities, 'administrative responsibilities', ['role']);
      parsedStudentMentoring = parseAndValidateArray(studentMentoring, 'student mentoring', ['studentName']);

      // Special handling for professional memberships (array of strings)
      parsedProfessionalMemberships = professionalMemberships ? JSON.parse(professionalMemberships) : [];
      if (!Array.isArray(parsedProfessionalMemberships) || parsedProfessionalMemberships.length === 0 || 
          !parsedProfessionalMemberships[0] || parsedProfessionalMemberships[0].trim() === '') {
        throw new Error('At least one professional membership is required');
      }
    } catch (validationError) {
      return res.status(400).json({ 
        message: validationError.message 
      });
    }

    // Handle uploaded files from multer
    let processedFiles = [];
    
    // Add existing files from frontend (for edit cases)
    if (uploadedFiles) {
      try {
        const existingFiles = typeof uploadedFiles === 'string' ? JSON.parse(uploadedFiles) : uploadedFiles;
        if (Array.isArray(existingFiles)) {
          processedFiles = existingFiles;
        }
      } catch (e) {
        console.log('Error parsing existing files:', e);
      }
    }

    // Add new uploaded files
    if (req.files && req.files.length > 0) {
      const newUploads = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file);
          return {
            fileName: file.originalname,
            fileUrl: result.secure_url,
            uploadedAt: new Date()
          };
        })
      );
      processedFiles = [...processedFiles, ...newUploads];
    }

    const appraisal = new Appraisal({
      faculty: facultyId,
      fullName,
      employeeCode,
      email,
      phoneNumber,
      department,
      designation,
      dateOfJoining,
      dateOfBirth,
      address,
      academicQualifications: parsedAcademicQualifications,
      researchPublications: parsedResearchPublications,
      seminars: parsedSeminars,
      projects: parsedProjects,
      lectures: parsedLectures,
      awardsRecognitions: parsedAwardsRecognitions,
      professionalMemberships: parsedProfessionalMemberships,
      coursesTaught: parsedCoursesTaught,
      administrativeResponsibilities: parsedAdministrativeResponsibilities,
      studentMentoring: parsedStudentMentoring,
      uploadedFiles: processedFiles,
      status: 'pending_hod',
    });

    await appraisal.save();
    res.status(201).json({ message: 'Appraisal submitted successfully', appraisal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



const getAllAppraisals = async (req, res) => {
  try {
    const appraisals = await Appraisal.find().populate('faculty', 'name email');
    res.json(appraisals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const appraisalId = req.params.id;
    const { role, approved, remarks } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({ message: '`approved` must be true or false' });
    }

    const appraisal = await Appraisal.findById(appraisalId);
    if (!appraisal) return res.status(404).json({ message: 'Appraisal not found' });

    if (role === 'hod') {
      if (appraisal.status !== 'pending_hod') {
        return res.status(400).json({ message: 'Appraisal is not pending HOD approval' });
      }
      appraisal.hodApproval = { approved, date: new Date(), remarks };
      appraisal.status = approved ? 'pending_admin' : 'rejected';
    } else if (role === 'admin') {
      if (appraisal.status !== 'pending_admin') {
        return res.status(400).json({ message: 'Appraisal is not pending Admin approval' });
      }
      appraisal.adminApproval = { approved, date: new Date(), remarks };
      appraisal.status = approved ? 'approved' : 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid role for approval' });
    }

    await appraisal.save();
    res.json({ message: `Appraisal ${approved ? 'approved' : 'rejected'} by ${role}`, appraisal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyAppraisals = async (req, res) => {
  try {
    const facultyId = req.user.userId;
    const appraisals = await Appraisal.find({ faculty: facultyId })
      .populate('faculty', 'name email')
      .sort({ submissionDate: -1 });
    
    res.json(appraisals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAppraisalById = async (req, res) => {
  try {
    const appraisalId = req.params.id;
    const facultyId = req.user.userId;
    
    const appraisal = await Appraisal.findOne({ 
      _id: appraisalId, 
      faculty: facultyId 
    }).populate('faculty', 'name email');
    
    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }
    
    res.json(appraisal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateAppraisal = async (req, res) => {
  try {
    const appraisalId = req.params.id;
    const facultyId = req.user.userId;
    
    const appraisal = await Appraisal.findOne({ 
      _id: appraisalId, 
      faculty: facultyId 
    });
    
    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }
    
    // Only allow editing if status is pending_hod or rejected
    if (appraisal.status !== 'pending_hod' && appraisal.status !== 'rejected') {
      return res.status(400).json({ 
        message: 'Cannot edit appraisal after HOD approval. Current status: ' + appraisal.status 
      });
    }

    const {
      fullName,
      employeeCode,
      email,
      phoneNumber,
      department,
      designation,
      dateOfJoining,
      dateOfBirth,
      address,
      academicQualifications,
      researchPublications,
      seminars,
      projects,
      lectures,
      awardsRecognitions,
      professionalMemberships,
      coursesTaught,
      administrativeResponsibilities,
      studentMentoring,
      uploadedFiles
    } = req.body;

    // Validate required personal information fields (same as submit)
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
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        return res.status(400).json({ 
          message: `${label} is required and cannot be empty` 
        });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Parse and validate professional information arrays (same validation as submit)
    const parseAndValidateArray = (data, fieldName, requiredSubFields = []) => {
      let parsed = [];
      try {
        parsed = data ? JSON.parse(data) : [];
      } catch (e) {
        throw new Error(`Invalid format for ${fieldName}`);
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error(`At least one ${fieldName} entry is required`);
      }

      // Check if first entry has required fields filled
      const firstEntry = parsed[0];
      for (const subField of requiredSubFields) {
        if (!firstEntry[subField] || firstEntry[subField].toString().trim() === '') {
          throw new Error(`${fieldName}: ${subField} is required in the first entry`);
        }
      }

      return parsed;
    };

    let parsedAcademicQualifications, parsedResearchPublications, parsedSeminars, 
        parsedProjects, parsedLectures, parsedAwardsRecognitions, parsedProfessionalMemberships,
        parsedCoursesTaught, parsedAdministrativeResponsibilities, parsedStudentMentoring;

    try {
      parsedAcademicQualifications = parseAndValidateArray(academicQualifications, 'academic qualifications', ['degree', 'institution', 'yearOfPassing']);
      parsedResearchPublications = parseAndValidateArray(researchPublications, 'research publications', ['title']);
      parsedSeminars = parseAndValidateArray(seminars, 'seminars', ['title']);
      parsedProjects = parseAndValidateArray(projects, 'projects', ['title']);
      parsedLectures = parseAndValidateArray(lectures, 'lectures', ['topic']);
      parsedAwardsRecognitions = parseAndValidateArray(awardsRecognitions, 'awards and recognitions', ['title']);
      parsedCoursesTaught = parseAndValidateArray(coursesTaught, 'courses taught', ['courseName']);
      parsedAdministrativeResponsibilities = parseAndValidateArray(administrativeResponsibilities, 'administrative responsibilities', ['role']);
      parsedStudentMentoring = parseAndValidateArray(studentMentoring, 'student mentoring', ['studentName']);

      // Special handling for professional memberships (array of strings)
      parsedProfessionalMemberships = professionalMemberships ? JSON.parse(professionalMemberships) : [];
      if (!Array.isArray(parsedProfessionalMemberships) || parsedProfessionalMemberships.length === 0 || 
          !parsedProfessionalMemberships[0] || parsedProfessionalMemberships[0].trim() === '') {
        throw new Error('At least one professional membership is required');
      }
    } catch (validationError) {
      return res.status(400).json({ 
        message: validationError.message 
      });
    }

    // Handle file updates
    let processedFiles = [];
    
    // Add existing files from frontend
    if (uploadedFiles) {
      try {
        const existingFiles = typeof uploadedFiles === 'string' ? JSON.parse(uploadedFiles) : uploadedFiles;
        if (Array.isArray(existingFiles)) {
          processedFiles = existingFiles;
        }
      } catch (e) {
        console.log('Error parsing existing files:', e);
      }
    }

    // Add new uploaded files using Cloudinary
    if (req.files && req.files.length > 0) {
      const newUploads = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file);
          return {
            fileName: file.originalname,
            fileUrl: result.secure_url,
            uploadedAt: new Date()
          };
        })
      );
      processedFiles = [...processedFiles, ...newUploads];
    }

    // Update all fields
    appraisal.fullName = fullName;
    appraisal.employeeCode = employeeCode;
    appraisal.email = email;
    appraisal.phoneNumber = phoneNumber;
    appraisal.department = department;
    appraisal.designation = designation;
    appraisal.dateOfJoining = dateOfJoining;
    appraisal.dateOfBirth = dateOfBirth;
    appraisal.address = address;
    appraisal.academicQualifications = parsedAcademicQualifications;
    appraisal.researchPublications = parsedResearchPublications;
    appraisal.seminars = parsedSeminars;
    appraisal.projects = parsedProjects;
    appraisal.lectures = parsedLectures;
    appraisal.awardsRecognitions = parsedAwardsRecognitions;
    appraisal.professionalMemberships = parsedProfessionalMemberships;
    appraisal.coursesTaught = parsedCoursesTaught;
    appraisal.administrativeResponsibilities = parsedAdministrativeResponsibilities;
    appraisal.studentMentoring = parsedStudentMentoring;
    appraisal.uploadedFiles = processedFiles;

    // Reset approval status if it was rejected
    if (appraisal.status === 'rejected') {
      appraisal.status = 'pending_hod';
      appraisal.hodApproval = { approved: null, date: null, remarks: null };
      appraisal.adminApproval = { approved: null, date: null, remarks: null };
    }

    await appraisal.save();
    res.json({ message: 'Appraisal updated successfully', appraisal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAppraisalStats = async (req, res) => {
  try {
    const facultyId = req.user.userId;
    const appraisals = await Appraisal.find({ faculty: facultyId });
    
    const stats = {
      total: appraisals.length,
      pending_hod: appraisals.filter(a => a.status === 'pending_hod').length,
      pending_admin: appraisals.filter(a => a.status === 'pending_admin').length,
      approved: appraisals.filter(a => a.status === 'approved').length,
      rejected: appraisals.filter(a => a.status === 'rejected').length
    };
    
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getHODAppraisals = async (req, res) => {
  try {
    const hodId = req.user.userId;
    
    // First, get the HOD's department
    const User = require('../models/user-model');
    const hod = await User.findById(hodId);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }
    
    // Find all appraisals from the same department
    const appraisals = await Appraisal.find({ department: hod.department })
      .populate('faculty', 'name email employeeCode')
      .sort({ submissionDate: -1 });
    
    res.json(appraisals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getHODAppraisalById = async (req, res) => {
  try {
    const hodId = req.user.userId;
    const appraisalId = req.params.id;
    
    // First, get the HOD's department
    const User = require('../models/user-model');
    const hod = await User.findById(hodId);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }
    
    // Find the appraisal and verify it belongs to the same department
    const appraisal = await Appraisal.findById(appraisalId)
      .populate('faculty', 'name email employeeCode department');
    
    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }
    
    // Check if the appraisal belongs to a faculty in the same department
    if (appraisal.department !== hod.department) {
      return res.status(403).json({ message: 'Access denied: Appraisal not in your department' });
    }
    
    res.json(appraisal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const reviewAppraisal = async (req, res) => {
  try {
    const hodId = req.user.userId;
    const { formId, action, reviewComments } = req.body;

    // Validate required fields
    if (!formId || !action || !reviewComments) {
      return res.status(400).json({ 
        message: 'Form ID, action, and review comments are required' 
      });
    }

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        message: 'Action must be either "approve" or "reject"' 
      });
    }

    // Validate formId format
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ 
        message: 'Invalid form ID format' 
      });
    }

    // Get HOD's department
    const User = require('../models/user-model');
    const hod = await User.findById(hodId);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    // Find the appraisal form
    const appraisal = await Appraisal.findById(formId)
      .populate('faculty', 'name email employeeCode department');

    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal form not found' });
    }

    // Verify appraisal belongs to HOD's department
    if (appraisal.department !== hod.department) {
      return res.status(403).json({ 
        message: 'Access denied: Appraisal not in your department' 
      });
    }

    // Check if appraisal is pending HOD review
    if (appraisal.status !== 'pending_hod') {
      return res.status(400).json({ 
        message: `Cannot review: Appraisal status is "${appraisal.status}". Only "pending_hod" appraisals can be reviewed.`
      });
    }

    // Update appraisal based on action
    const approved = action === 'approve';
    appraisal.hodApproval = {
      approved: approved,
      date: new Date(),
      remarks: reviewComments
    };
    appraisal.status = approved ? 'pending_admin' : 'rejected';

    // Save the updated appraisal
    await appraisal.save();

    // Prepare response message
    const actionText = approved ? 'approved and forwarded to admin' : 'rejected';
    const message = `Appraisal ${actionText} successfully`;

    res.json({
      success: true,
      message: message,
      appraisal: {
        id: appraisal._id,
        status: appraisal.status,
        hodApproval: appraisal.hodApproval,
        faculty: appraisal.faculty
      }
    });

  } catch (error) {
    console.error('Review appraisal error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid form ID format' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    }

    res.status(500).json({ 
      message: 'Server error while processing review', 
      error: error.message 
    });
  }
};

const generateAppraisalPDF = async (req, res) => {
  try {
    const appraisalId = req.params.id;
    const facultyId = req.user.userId;
    
    const appraisal = await Appraisal.findOne({ 
      _id: appraisalId, 
      faculty: facultyId 
    }).populate('faculty', 'name email employeeCode');
    
    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    // Helper function to check if a value exists and is not empty
    const hasValue = (value) => {
      if (Array.isArray(value)) {
        return value.length > 0 && value.some(item => {
          if (typeof item === 'string') return item.trim() !== '';
          if (typeof item === 'object') return Object.values(item).some(v => v && v.toString().trim() !== '');
          return Boolean(item);
        });
      }
      return value && value.toString().trim() !== '';
    };

    // Helper function to check if file is an image
    const isImageFile = (fileName) => {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
      const extension = fileName.split('.').pop().toLowerCase();
      return imageExtensions.includes(extension);
    };

    // Helper function to check if file is a PDF
    const isPDFFile = (fileName) => {
      const extension = fileName.split('.').pop().toLowerCase();
      return extension === 'pdf';
    };

    // Helper function to get file type icon
    const getFileTypeIcon = (fileName) => {
      const extension = fileName.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
        return '🖼️';
      } else if (extension === 'pdf') {
        return '📄';
      } else if (['doc', 'docx'].includes(extension)) {
        return '📝';
      } else if (['zip', 'rar', '7z'].includes(extension)) {
        return '📦';
      } else {
        return '📎';
      }
    };

    // Generate supporting documents section with images and PDF previews
    const generateSupportingDocumentsSection = () => {
      if (!hasValue(appraisal.uploadedFiles)) return '';
      
      const imageFiles = appraisal.uploadedFiles.filter(file => isImageFile(file.fileName));
      const pdfFiles = appraisal.uploadedFiles.filter(file => isPDFFile(file.fileName));
      const otherFiles = appraisal.uploadedFiles.filter(file => !isImageFile(file.fileName) && !isPDFFile(file.fileName));
      
      let section = '<div class="section"><div class="section-title">Supporting Documents</div>';
      
      // Add images
      if (imageFiles.length > 0) {
        section += '<div class="subsection"><h3 class="subsection-title">📷 Images</h3>';
        section += '<div class="images-grid">';
        imageFiles.forEach(file => {
          section += `
            <div class="image-container">
              <img src="${file.fileUrl}" alt="${file.fileName}" class="document-image" />
              <p class="image-caption">${file.fileName}</p>
              <p class="image-date">Uploaded: ${new Date(file.uploadedAt).toLocaleDateString()}</p>
            </div>
          `;
        });
        section += '</div></div>';
      }
      
      // Add PDF previews
      if (pdfFiles.length > 0) {
        section += '<div class="subsection page-break"><h3 class="subsection-title">📄 PDF Documents</h3>';
        pdfFiles.forEach(file => {
          section += `
            <div class="pdf-container">
              <div class="pdf-header">
                <h4 class="pdf-title">📄 ${file.fileName}</h4>
                <p class="pdf-info">Uploaded: ${new Date(file.uploadedAt).toLocaleDateString()}</p>
                <p class="pdf-url">URL: <a href="${file.fileUrl}" target="_blank">${file.fileUrl}</a></p>
              </div>
              <div class="pdf-preview">
                <iframe src="${file.fileUrl}#toolbar=0&navpanes=0&scrollbar=0" 
                        class="pdf-iframe" 
                        frameborder="0">
                </iframe>
                <div class="pdf-fallback">
                  <p><strong>PDF Preview:</strong> ${file.fileName}</p>
                  <p>📄 This is a PDF document. To view the full content, please access the URL above.</p>
                  <div class="pdf-placeholder">
                    <div class="pdf-icon">📄</div>
                    <p><strong>${file.fileName}</strong></p>
                    <p class="pdf-note">PDF content cannot be fully displayed in this preview</p>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
        section += '</div>';
      }
      
      // Add other documents
      if (otherFiles.length > 0) {
        section += '<div class="subsection"><h3 class="subsection-title">📎 Other Documents</h3>';
        section += '<div class="files-grid">';
        otherFiles.forEach(file => {
          section += `
            <div class="file-card">
              <div class="file-icon">${getFileTypeIcon(file.fileName)}</div>
              <div class="file-details">
                <h4 class="file-name">${file.fileName}</h4>
                <p class="file-date">Uploaded: ${new Date(file.uploadedAt).toLocaleDateString()}</p>
                <p class="file-url"><a href="${file.fileUrl}" target="_blank">View Document</a></p>
              </div>
            </div>
          `;
        });
        section += '</div></div>';
      }
      
      section += '</div>';
      return section;
    };

    // Generate HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 40px; }
            .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #1e40af; margin: 0; font-size: 28px; }
            .header p { color: #6b7280; margin: 5px 0; }
            .section { margin-bottom: 25px; page-break-inside: avoid; }
            .section-title { background: #3b82f6; color: white; padding: 8px 15px; margin: 20px 0 15px 0; font-size: 16px; font-weight: bold; }
            .subsection { margin-bottom: 20px; }
            .subsection-title { color: #374151; font-size: 14px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #374151; display: block; margin-bottom: 3px; }
            .info-value { color: #6b7280; }
            .item-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
            .item-title { font-weight: bold; color: #1f2937; margin-bottom: 5px; }
            .item-details { color: #6b7280; font-size: 14px; }
            .status-badge { 
                display: inline-block; 
                padding: 4px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: bold;
                ${appraisal.status === 'approved' ? 'background: #dcfce7; color: #166534;' : 
                  appraisal.status === 'rejected' ? 'background: #fef2f2; color: #dc2626;' :
                  appraisal.status === 'pending_admin' ? 'background: #dbeafe; color: #1d4ed8;' :
                  'background: #fef3c7; color: #d97706;'}
            }
            .files-list { list-style: none; padding: 0; }
            .files-list li { background: #f3f4f6; padding: 8px 12px; margin: 5px 0; border-radius: 5px; }
            .images-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                gap: 20px; 
                margin-bottom: 20px; 
            }
            .image-container { 
                text-align: center; 
                page-break-inside: avoid; 
                background: #f9fafb; 
                border: 1px solid #e5e7eb; 
                border-radius: 8px; 
                padding: 15px; 
            }
            .document-image { 
                max-width: 100%; 
                max-height: 300px; 
                width: auto; 
                height: auto; 
                object-fit: contain; 
                border: 1px solid #d1d5db; 
                border-radius: 4px; 
                margin-bottom: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .image-caption { 
                font-weight: bold; 
                color: #374151; 
                margin: 8px 0 4px 0; 
                font-size: 14px; 
            }
            .image-date { 
                color: #6b7280; 
                font-size: 12px; 
                margin: 0; 
            }
            .pdf-container {
                margin-bottom: 30px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: #ffffff;
                page-break-inside: avoid;
            }
            .pdf-header {
                background: #f8fafc;
                padding: 15px;
                border-bottom: 1px solid #e5e7eb;
                border-radius: 8px 8px 0 0;
            }
            .pdf-title {
                margin: 0 0 8px 0;
                color: #1f2937;
                font-size: 16px;
                font-weight: bold;
            }
            .pdf-info {
                margin: 4px 0;
                color: #6b7280;
                font-size: 12px;
            }
            .pdf-url {
                margin: 4px 0 0 0;
                font-size: 11px;
            }
            .pdf-url a {
                color: #3b82f6;
                text-decoration: none;
                word-break: break-all;
            }
            .pdf-preview {
                position: relative;
                height: 500px;
                overflow: hidden;
            }
            .pdf-iframe {
                width: 100%;
                height: 100%;
                border: none;
                display: block;
            }
            .pdf-fallback {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #f9fafb;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 40px;
            }
            .pdf-placeholder {
                background: white;
                border: 2px dashed #d1d5db;
                border-radius: 8px;
                padding: 40px;
                max-width: 400px;
                margin-top: 20px;
            }
            .pdf-icon {
                font-size: 48px;
                margin-bottom: 15px;
            }
            .pdf-note {
                color: #6b7280;
                font-size: 12px;
                margin-top: 10px;
                font-style: italic;
            }
            .files-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 15px;
            }
            .file-card {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .file-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            .file-details {
                flex-grow: 1;
            }
            .file-name {
                margin: 0 0 5px 0;
                font-size: 14px;
                font-weight: bold;
                color: #1f2937;
            }
            .file-date {
                margin: 2px 0;
                font-size: 12px;
                color: #6b7280;
            }
            .file-url {
                margin: 5px 0 0 0;
                font-size: 11px;
            }
            .file-url a {
                color: #3b82f6;
                text-decoration: none;
            }
            @media print { 
                .page-break { page-break-before: always; } 
                .image-container { page-break-inside: avoid; }
                .images-grid { page-break-inside: avoid; }
                .pdf-container { page-break-inside: avoid; }
                .pdf-iframe { display: none; }
                .pdf-fallback { position: static; background: transparent; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Faculty Appraisal Report</h1>
            <p><strong>${appraisal.fullName}</strong> • ${appraisal.department}</p>
            <p>Employee Code: ${appraisal.employeeCode}</p>
            <span class="status-badge">
                ${appraisal.status === 'approved' ? 'Approved' : 
                  appraisal.status === 'rejected' ? 'Rejected' :
                  appraisal.status === 'pending_admin' ? 'Pending Admin Review' :
                  'Pending HOD Review'}
            </span>
            <p style="margin-top: 10px; color: #6b7280;">Generated on: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Full Name:</span>
                    <span class="info-value">${appraisal.fullName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Employee Code:</span>
                    <span class="info-value">${appraisal.employeeCode}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${appraisal.email}</span>
                </div>
                ${hasValue(appraisal.phoneNumber) ? `
                <div class="info-item">
                    <span class="info-label">Phone Number:</span>
                    <span class="info-value">${appraisal.phoneNumber}</span>
                </div>` : ''}
                <div class="info-item">
                    <span class="info-label">Department:</span>
                    <span class="info-value">${appraisal.department}</span>
                </div>
                ${hasValue(appraisal.designation) ? `
                <div class="info-item">
                    <span class="info-label">Designation:</span>
                    <span class="info-value">${appraisal.designation}</span>
                </div>` : ''}
                ${hasValue(appraisal.dateOfJoining) ? `
                <div class="info-item">
                    <span class="info-label">Date of Joining:</span>
                    <span class="info-value">${new Date(appraisal.dateOfJoining).toLocaleDateString()}</span>
                </div>` : ''}
                ${hasValue(appraisal.dateOfBirth) ? `
                <div class="info-item">
                    <span class="info-label">Date of Birth:</span>
                    <span class="info-value">${new Date(appraisal.dateOfBirth).toLocaleDateString()}</span>
                </div>` : ''}
            </div>
            ${hasValue(appraisal.address) ? `
            <div class="info-item">
                <span class="info-label">Address:</span>
                <span class="info-value">${appraisal.address}</span>
            </div>` : ''}
        </div>

        ${hasValue(appraisal.academicQualifications) ? `
        <div class="section">
            <div class="section-title">Academic Qualifications</div>
            ${appraisal.academicQualifications.filter(q => hasValue(q.degree)).map(qual => `
                <div class="item-card">
                    <div class="item-title">${qual.degree}</div>
                    <div class="item-details">
                        ${hasValue(qual.institution) ? `Institution: ${qual.institution}<br>` : ''}
                        ${hasValue(qual.yearOfPassing) ? `Year of Passing: ${qual.yearOfPassing}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>` : ''}

        ${hasValue(appraisal.researchPublications) ? `
        <div class="section">
            <div class="section-title">Research Publications</div>
            ${appraisal.researchPublications.filter(p => hasValue(p.title)).map(pub => `
                <div class="item-card">
                    <div class="item-title">${pub.title}</div>
                    <div class="item-details">
                        ${hasValue(pub.journal) ? `Journal: ${pub.journal}<br>` : ''}
                        ${hasValue(pub.year) ? `Year: ${pub.year}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>` : ''}

        ${hasValue(appraisal.projects) ? `
        <div class="section">
            <div class="section-title">Research Projects</div>
            ${appraisal.projects.filter(p => hasValue(p.title)).map(project => `
                <div class="item-card">
                    <div class="item-title">${project.title}</div>
                    <div class="item-details">
                        ${hasValue(project.description) ? `Description: ${project.description}<br>` : ''}
                        ${hasValue(project.year) ? `Year: ${project.year}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>` : ''}

        ${hasValue(appraisal.awardsRecognitions) ? `
        <div class="section">
            <div class="section-title">Awards & Recognition</div>
            ${appraisal.awardsRecognitions.filter(a => hasValue(a.title)).map(award => `
                <div class="item-card">
                    <div class="item-title">${award.title}</div>
                    <div class="item-details">
                        ${hasValue(award.organization) ? `Organization: ${award.organization}<br>` : ''}
                        ${hasValue(award.year) ? `Year: ${award.year}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>` : ''}

        ${hasValue(appraisal.seminars) ? `
        <div class="section">
            <div class="section-title">Seminars & Workshops</div>
            ${appraisal.seminars.filter(s => hasValue(s.title)).map(seminar => `
                <div class="item-card">
                    <div class="item-title">${seminar.title}</div>
                    <div class="item-details">
                        ${hasValue(seminar.venue) ? `Venue: ${seminar.venue}<br>` : ''}
                        ${hasValue(seminar.date) ? `Date: ${new Date(seminar.date).toLocaleDateString()}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>` : ''}

        ${hasValue(appraisal.lectures) ? `
        <div class="section">
            <div class="section-title">Guest Lectures</div>
            ${appraisal.lectures.filter(l => hasValue(l.topic)).map(lecture => `
                <div class="item-card">
                    <div class="item-title">${lecture.topic}</div>
                    <div class="item-details">
                        ${hasValue(lecture.date) ? `Date: ${new Date(lecture.date).toLocaleDateString()}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>` : ''}

        ${hasValue(appraisal.professionalMemberships) ? `
        <div class="section">
            <div class="section-title">Professional Memberships</div>
            ${appraisal.professionalMemberships.filter(m => hasValue(m)).map(membership => `
                <div class="item-card">
                    <div class="item-title">${membership}</div>
                </div>
            `).join('')}
        </div>` : ''}

        ${hasValue(appraisal.coursesTaught) ? `
        <div class="section">
            <div class="section-title">Courses Taught</div>
            ${appraisal.coursesTaught.filter(c => hasValue(c.courseName)).map(course => `
                <div class="item-card">
                    <div class="item-title">${course.courseName}</div>
                    <div class="item-details">
                        ${hasValue(course.semester) ? `Semester: ${course.semester}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>` : ''}

        ${hasValue(appraisal.administrativeResponsibilities) ? `
        <div class="section">
            <div class="section-title">Administrative Responsibilities</div>
            ${appraisal.administrativeResponsibilities.filter(r => hasValue(r.role)).map(resp => `
                <div class="item-card">
                    <div class="item-title">${resp.role}</div>
                    <div class="item-details">
                        ${hasValue(resp.duration) ? `Duration: ${resp.duration}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>` : ''}

        ${hasValue(appraisal.studentMentoring) ? `
        <div class="section">
            <div class="section-title">Student Mentoring</div>
            ${appraisal.studentMentoring.filter(m => hasValue(m.studentName)).map(mentoring => `
                <div class="item-card">
                    <div class="item-title">${mentoring.studentName}</div>
                    <div class="item-details">
                        ${hasValue(mentoring.projectTitle) ? `Project: ${mentoring.projectTitle}<br>` : ''}
                        ${hasValue(mentoring.year) ? `Year: ${mentoring.year}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>` : ''}

        ${generateSupportingDocumentsSection()}

        ${(hasValue(appraisal.hodApproval?.remarks) || hasValue(appraisal.adminApproval?.remarks)) ? `
        <div class="section">
            <div class="section-title">Review Comments</div>
            ${hasValue(appraisal.hodApproval?.remarks) ? `
                <div class="item-card">
                    <div class="item-title">HOD Review</div>
                    <div class="item-details">
                        ${appraisal.hodApproval.remarks}
                        ${appraisal.hodApproval.date ? `<br><br>Reviewed on: ${new Date(appraisal.hodApproval.date).toLocaleDateString()}` : ''}
                    </div>
                </div>
            ` : ''}
            ${hasValue(appraisal.adminApproval?.remarks) ? `
                <div class="item-card">
                    <div class="item-title">Admin Review</div>
                    <div class="item-details">
                        ${appraisal.adminApproval.remarks}
                        ${appraisal.adminApproval.date ? `<br><br>Reviewed on: ${new Date(appraisal.adminApproval.date).toLocaleDateString()}` : ''}
                    </div>
                </div>
            ` : ''}
        </div>` : ''}

        <div class="section" style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an auto-generated document from the Faculty Appraisal System.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    await browser.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${appraisal.fullName}_Appraisal_${new Date().toISOString().split('T')[0]}.pdf"`);
    
    res.send(pdf);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
};
module.exports = { 
  submitAppraisal, 
  getAllAppraisals, 
  updateStatus, 
  getMyAppraisals, 
  getAppraisalById, 
  updateAppraisal, 
  getAppraisalStats, 
  getHODAppraisals, 
  getHODAppraisalById, 
  reviewAppraisal,
  generateAppraisalPDF,
};
