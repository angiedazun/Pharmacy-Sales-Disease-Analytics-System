const User = require('../models/User');
const { createLog } = require('./auditController');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('pharmacy', 'name district').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    createLog({ user: req.user, action: 'CREATE', resource: 'User', resourceId: user._id, description: `Created user ${user.email}`, req });
    res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true }).populate('pharmacy');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    createLog({ user: req.user, action: 'UPDATE', resource: 'User', resourceId: req.params.id, description: `Updated user ${user.email}`, req });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false });
    createLog({ user: req.user, action: 'DELETE', resource: 'User', resourceId: req.params.id, description: `Deactivated user ${user?.email}`, req });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
