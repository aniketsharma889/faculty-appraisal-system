const jwt = require('jsonwebtoken');
const User = require('../models/user-model');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

const hodOnly = (req, res, next) => {
  if (req.user.role !== 'hod') {
    return res.status(403).json({ message: 'Access denied: HODs only' });
  }
  next();
};

module.exports = { auth, adminOnly, hodOnly };
