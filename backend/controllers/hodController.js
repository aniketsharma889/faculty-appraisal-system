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

const getReportsData = async (req, res) => {
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
    const appraisals = await Appraisal.find({ department: hod.department })
      .populate('faculty', 'name email employeeCode')
      .sort({ submissionDate: -1 });

    // Calculate comprehensive stats
    const stats = {
      totalFaculty: facultyList.length,
      totalAppraisals: appraisals.length,
      pendingHOD: appraisals.filter(a => a.status === 'pending_hod').length,
      pendingAdmin: appraisals.filter(a => a.status === 'pending_admin').length,
      approved: appraisals.filter(a => a.status === 'approved').length,
      rejected: appraisals.filter(a => a.status === 'rejected').length,
      submissionRate: facultyList.length > 0 ? Math.round((new Set(appraisals.map(a => a.faculty?.toString())).size / facultyList.length) * 100) : 0
    };

    // Process submission trends by day of week
    const submissionTrends = processSubmissionTrends(appraisals);

    // Get pending appraisals with days since submission
    const pendingAppraisals = appraisals
      .filter(a => a.status === 'pending_hod')
      .map(appraisal => {
        const daysSince = Math.floor(
          (new Date() - new Date(appraisal.submissionDate)) / (1000 * 60 * 60 * 24)
        );
        return {
          ...appraisal.toObject(),
          daysSinceSubmission: daysSince
        };
      })
      .sort((a, b) => b.daysSinceSubmission - a.daysSinceSubmission);

    res.json({
      stats,
      submissionTrends,
      pendingAppraisals,
      facultyList,
      appraisals
    });
  } catch (error) {
    console.error('Error fetching reports data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const processSubmissionTrends = (appraisals) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const trends = daysOfWeek.map(day => ({ day, count: 0 }));
  
  appraisals.forEach(appraisal => {
    const submissionDate = new Date(appraisal.submissionDate);
    const dayOfWeek = submissionDate.getDay();
    trends[dayOfWeek].count++;
  });
  
  return trends;
};

module.exports = { getDepartmentFaculty, getDashboardStats, getReportsData };
