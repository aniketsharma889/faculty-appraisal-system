const Appraisal = require('../models/appraisal-form-model');
const User = require('../models/user-model');
const mongoose = require('mongoose');

const getAllAppraisalsForAdmin = async (req, res) => {
  try {
    // Get all appraisals with faculty details
    const appraisals = await Appraisal.find()
      .populate('faculty', 'name email employeeCode department')
      .sort({ submissionDate: -1 });
    
    res.json(appraisals);
  } catch (error) {
    console.error('Error fetching all appraisals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAppraisalByIdForAdmin = async (req, res) => {
  try {
    const appraisalId = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(appraisalId)) {
      return res.status(400).json({ message: 'Invalid appraisal ID format' });
    }
    
    const appraisal = await Appraisal.findById(appraisalId)
      .populate('faculty', 'name email employeeCode department');
    
    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }
    
    res.json(appraisal);
  } catch (error) {
    console.error('Error fetching appraisal by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const reviewAppraisalAsAdmin = async (req, res) => {
  try {
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

    // Find the appraisal form
    const appraisal = await Appraisal.findById(formId)
      .populate('faculty', 'name email employeeCode department');

    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal form not found' });
    }

    // Check if appraisal is pending admin review
    if (appraisal.status !== 'pending_admin') {
      return res.status(400).json({ 
        message: `Cannot review: Appraisal status is "${appraisal.status}". Only "pending_admin" appraisals can be reviewed.`
      });
    }

    // Update appraisal based on action
    const approved = action === 'approve';
    appraisal.adminApproval = {
      approved: approved,
      date: new Date(),
      remarks: reviewComments
    };
    appraisal.status = approved ? 'approved' : 'rejected';

    await appraisal.save();

    const actionText = approved ? 'approved' : 'rejected';
    const message = `Appraisal ${actionText} successfully`;

    res.json({
      success: true,
      message: message,
      appraisal: {
        id: appraisal._id,
        status: appraisal.status,
        adminApproval: appraisal.adminApproval,
        faculty: appraisal.faculty
      }
    });

  } catch (error) {
    console.error('Admin review appraisal error:', error);
    
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

const getDashboardStats = async (req, res) => {
  try {
    // Get all appraisals and users for statistics
    const [appraisals, users] = await Promise.all([
      Appraisal.find().populate('faculty', 'name email employeeCode department'),
      User.find().select('-password')
    ]);

    const stats = {
      totalUsers: users.length,
      totalAppraisals: appraisals.length,
      pendingHOD: appraisals.filter(a => a.status === 'pending_hod').length,
      pendingAdmin: appraisals.filter(a => a.status === 'pending_admin').length,
      approved: appraisals.filter(a => a.status === 'approved').length,
      rejected: appraisals.filter(a => a.status === 'rejected').length
    };

    // Get recent appraisals (last 8)
    const recentAppraisals = appraisals
      .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
      .slice(0, 8);

    res.json({
      stats,
      recentAppraisals
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Get all users excluding passwords
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Get user by ID excluding password
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeCode: user.employeeCode,
        department: user.department,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserAsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, employeeCode, department, role } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Prevent admin role assignment
    if (role === 'admin') {
      return res.status(400).json({ message: 'Cannot assign admin role through this endpoint' });
    }

    // Role-specific validation for faculty and HOD only
    if (!employeeCode || !department) {
      return res.status(400).json({ 
        message: 'Employee code and department are required for faculty and HOD roles' 
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Update user - only allow faculty and HOD roles
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        role,
        employeeCode,
        department
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        employeeCode: updatedUser.employeeCode,
        department: updatedUser.department,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const promoteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole, department, employeeCode } = req.body;

    // Allowed roles - removed admin
    const validRoles = ['faculty', 'hod'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role specified. Only faculty and HOD roles are allowed.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentRole = user.role;

    // Prevent changing from Admin to any role
    if (currentRole === 'admin') {
      return res.status(400).json({ message: 'Cannot change admin role' });
    }

    // Prevent promoting to admin
    if (newRole === 'admin') {
      return res.status(400).json({ message: 'Cannot promote users to admin role' });
    }

    // Role transition validation - only faculty <-> HOD transitions allowed
    if (!department || !employeeCode) {
      return res.status(400).json({
        message: 'Department and employee code are required for role changes'
      });
    }

    // Update user with new role
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        role: newRole,
        department: department,
        employeeCode: employeeCode
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found after update' });
    }

    return res.json({
      message:
        currentRole === 'faculty' && newRole === 'hod'
          ? 'User promoted to HOD successfully'
          : currentRole === 'hod' && newRole === 'faculty'
          ? 'User demoted to Faculty successfully'
          : 'User role updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        employeeCode: updatedUser.employeeCode,
        department: updatedUser.department,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDepartments = async (req, res) => {
  try {
    // Get all users with department information
    const users = await User.find({ 
      department: { $exists: true, $ne: null } 
    }).select('-password').sort({ department: 1, name: 1 });

    // Group users by department
    const departmentMap = {};
    
    users.forEach(user => {
      if (!departmentMap[user.department]) {
        departmentMap[user.department] = {
          name: user.department,
          users: [],
          stats: {
            totalUsers: 0,
            totalFaculty: 0,
            totalHODs: 0
          }
        };
      }
      
      departmentMap[user.department].users.push({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeCode: user.employeeCode,
        createdAt: user.createdAt
      });
      
      // Update statistics
      departmentMap[user.department].stats.totalUsers += 1;
      if (user.role === 'faculty') {
        departmentMap[user.department].stats.totalFaculty += 1;
      } else if (user.role === 'hod') {
        departmentMap[user.department].stats.totalHODs += 1;
      }
    });

    // Convert to array and sort by department name
    const departments = Object.values(departmentMap).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    // Get overall statistics
    const overallStats = {
      totalDepartments: departments.length,
      totalUsers: users.length,
      totalFaculty: users.filter(u => u.role === 'faculty').length,
      totalHODs: users.filter(u => u.role === 'hod').length
    };

    res.json({
      success: true,
      departments,
      overallStats
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  getAllAppraisalsForAdmin, 
  getAppraisalByIdForAdmin, 
  reviewAppraisalAsAdmin,
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserAsAdmin,
  promoteUser,
  getDepartments
};