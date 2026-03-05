const Medicine = require('../models/Medicine');

// @desc   Get all medicines
// @route  GET /api/medicines
exports.getMedicines = async (req, res) => {
  try {
    const { category, type, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query)
      .populate('diseases', 'name category severity')
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: medicines.length, total, data: medicines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single medicine
// @route  GET /api/medicines/:id
exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('diseases');
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create medicine
// @route  POST /api/medicines
exports.createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update medicine
// @route  PUT /api/medicines/:id
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('diseases');
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete medicine
// @route  DELETE /api/medicines/:id
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, message: 'Medicine deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
