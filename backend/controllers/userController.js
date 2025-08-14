const User = require('../models/user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password, employeeCode, role, department } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Prevent admin registration through this endpoint
    if (role === 'admin') {
      return res.status(400).json({
        message: 'Admin registration is not allowed through this endpoint.',
      });
    }

    // Validate required fields based on role
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required for all registrations.',
      });
    }

    // Role-specific validation for faculty and HOD (they need employee code and department)
    if (role === 'faculty' || role === 'hod') {
      if (!employeeCode || !department) {
        return res.status(400).json({
          message: 'Employee code and department are required for faculty and HOD registration.',
        });
      }
    }

    // Prepare user data
    const userData = {
      name,
      email,
      password,
      role: role || 'faculty' // default to faculty if no role specified
    };

    // Add employeeCode and department only for faculty and HOD
    if (role === 'faculty' || role === 'hod') {
      userData.employeeCode = employeeCode;
      userData.department = department;
    } else {
      userData.employeeCode = undefined; // make sure it's not null
    }

    const user = new User(userData);
    await user.save();

    return res.status(201).json({ 
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully` 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) 
      return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) 
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        department: user.department,
        employeeCode: user.employeeCode
      } 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ 
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
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, employeeCode, department } = req.body;
    const userId = req.user.userId;
    const requestedUserId = req.params.id;

    // Security check: users can only update their own profile, unless they're admin
    if (userId !== requestedUserId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // Check if email is already taken by another user
    if (email) {
      const targetUserId = req.user.role === 'admin' ? requestedUserId : userId;
      const existingUser = await User.findOne({ email, _id: { $ne: targetUserId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update user profile
    const targetUserId = req.user.role === 'admin' ? requestedUserId : userId;
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(employeeCode && { employeeCode }),
        ...(department && { department })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'Profile updated successfully',
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
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
