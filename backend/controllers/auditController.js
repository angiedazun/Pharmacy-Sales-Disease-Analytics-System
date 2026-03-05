const AuditLog = require('../models/AuditLog');

// Helper: create audit entry (callable from other controllers)
exports.createLog = async ({ user, action, resource, resourceId, description, req, metadata }) => {
  try {
    await AuditLog.create({
      user: user._id || user,
      userName: user.name || '',
      userRole: user.role || '',
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : undefined,
      description,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.['user-agent'],
      metadata
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

// @desc   Get audit logs (admin only)
// @route  GET /api/audit
exports.getAuditLogs = async (req, res) => {
  try {
    const { resource, action, userId, page = 1, limit = 30 } = req.query;
    const query = {};
    if (resource) query.resource = resource;
    if (action) query.action = action;
    if (userId) query.user = userId;

    const skip = (page - 1) * limit;
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
