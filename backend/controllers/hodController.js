const User = require('../models/user-model');

const getDepartmentFaculty = async (req, res) => {
  try {
    // Find HOD's department from logged-in user
    const hod = await User.findById(req.user.userId);
    if (!hod || hod.role !== 'hod') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all faculty in same department
    const facultyList = await User.find({
      department: hod.department,
      role: 'faculty'
    }).select('-password'); // hide password field

    res.json(facultyList);
  } catch (error) {
    console.error('Error fetching department faculty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const hod = await User.findById(req.user.userId);
    if (!hod || hod.role !== 'hod') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const Appraisal = require('../models/appraisal-form-model');
    
    // Get all faculty in same department
    const facultyList = await User.find({
      department: hod.department,
      role: 'faculty'
    }).select('-password');

    // Get all appraisals from the same department
    const appraisals = await Appraisal.find({ department: hod.department });

    const stats = {
      totalFaculty: facultyList.length,
      totalAppraisals: appraisals.length,
      pendingReview: appraisals.filter(a => a.status === 'pending_hod').length,
      processed: appraisals.filter(a => a.status === 'pending_admin').length,
      approved: appraisals.filter(a => a.status === 'approved').length,
      rejected: appraisals.filter(a => a.status === 'rejected').length,
      submissionRate: facultyList.length > 0 ? Math.round((new Set(appraisals.map(a => a.faculty?.toString())).size / facultyList.length) * 100) : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDepartmentFaculty, getDashboardStats };
