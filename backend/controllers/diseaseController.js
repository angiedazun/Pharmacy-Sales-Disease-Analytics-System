const Disease = require('../models/Disease');

exports.getDiseases = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const diseases = await Disease.find(query).sort({ name: 1 });
    res.json({ success: true, count: diseases.length, data: diseases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDisease = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) return res.status(404).json({ success: false, message: 'Disease not found' });
    res.json({ success: true, data: disease });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDisease = async (req, res) => {
  try {
    const disease = await Disease.create(req.body);
    res.status(201).json({ success: true, data: disease });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDisease = async (req, res) => {
  try {
    const disease = await Disease.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!disease) return res.status(404).json({ success: false, message: 'Disease not found' });
    res.json({ success: true, data: disease });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDisease = async (req, res) => {
  try {
    const disease = await Disease.findByIdAndDelete(req.params.id);
    if (!disease) return res.status(404).json({ success: false, message: 'Disease not found' });
    res.json({ success: true, message: 'Disease deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
