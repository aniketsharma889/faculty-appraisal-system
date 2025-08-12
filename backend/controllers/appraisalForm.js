const Appraisal = require('../models/appraisal-form-model');
const mongoose = require('mongoose');

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
      uploadedFiles // This will come from frontend for existing files
    } = req.body;

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
      const newFiles = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        uploadedAt: new Date()
      }));
      processedFiles = [...processedFiles, ...newFiles];
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
      academicQualifications: academicQualifications ? JSON.parse(academicQualifications) : [],
      researchPublications: researchPublications ? JSON.parse(researchPublications) : [],
      seminars: seminars ? JSON.parse(seminars) : [],
      projects: projects ? JSON.parse(projects) : [],
      lectures: lectures ? JSON.parse(lectures) : [],
      awardsRecognitions: awardsRecognitions ? JSON.parse(awardsRecognitions) : [],
      professionalMemberships: professionalMemberships ? JSON.parse(professionalMemberships) : [],
      coursesTaught: coursesTaught ? JSON.parse(coursesTaught) : [],
      administrativeResponsibilities: administrativeResponsibilities ? JSON.parse(administrativeResponsibilities) : [],
      studentMentoring: studentMentoring ? JSON.parse(studentMentoring) : [],
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

    // Add new uploaded files
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        uploadedAt: new Date()
      }));
      processedFiles = [...processedFiles, ...newFiles];
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
    appraisal.academicQualifications = academicQualifications ? JSON.parse(academicQualifications) : [];
    appraisal.researchPublications = researchPublications ? JSON.parse(researchPublications) : [];
    appraisal.seminars = seminars ? JSON.parse(seminars) : [];
    appraisal.projects = projects ? JSON.parse(projects) : [];
    appraisal.lectures = lectures ? JSON.parse(lectures) : [];
    appraisal.awardsRecognitions = awardsRecognitions ? JSON.parse(awardsRecognitions) : [];
    appraisal.professionalMemberships = professionalMemberships ? JSON.parse(professionalMemberships) : [];
    appraisal.coursesTaught = coursesTaught ? JSON.parse(coursesTaught) : [];
    appraisal.administrativeResponsibilities = administrativeResponsibilities ? JSON.parse(administrativeResponsibilities) : [];
    appraisal.studentMentoring = studentMentoring ? JSON.parse(studentMentoring) : [];
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

module.exports = { submitAppraisal, getAllAppraisals, updateStatus, getMyAppraisals, getAppraisalById, updateAppraisal, getAppraisalStats, getHODAppraisals, getHODAppraisalById, reviewAppraisal };
