const Pharmacy = require('../models/Pharmacy');

exports.getPharmacies = async (req, res) => {
  try {
    const { district, isActive } = req.query;
    const query = {};
    if (district) query.district = district;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const pharmacies = await Pharmacy.find(query).sort({ name: 1 });
    res.json({ success: true, count: pharmacies.length, data: pharmacies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    res.json({ success: true, data: pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.create(req.body);
    res.status(201).json({ success: true, data: pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    res.json({ success: true, data: pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePharmacy = async (req, res) => {
  try {
    await Pharmacy.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Pharmacy deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
