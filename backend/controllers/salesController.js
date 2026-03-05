const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const { createLog } = require('./auditController');

// @desc   Create sale record
// @route  POST /api/sales
exports.createSale = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.body.medicine);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });

    // Pharmacy users can only add to their own pharmacy
    let pharmacyId = req.body.pharmacy;
    if (req.user.role === 'pharmacy') {
      pharmacyId = req.user.pharmacy?._id || req.user.pharmacy;
    }

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });

    const saleData = {
      ...req.body,
      pharmacy: pharmacyId,
      district: pharmacy.district,
      recordedBy: req.user._id,
      unitPrice: req.body.unitPrice || medicine.price
    };

    const sale = await Sale.create(saleData);
    const populated = await Sale.findById(sale._id)
      .populate('medicine', 'name genericName category')
      .populate('pharmacy', 'name district');

    createLog({ user: req.user, action: 'CREATE', resource: 'Sale', resourceId: sale._id, description: `Recorded sale: ${medicine.name} x${req.body.quantity}`, req });
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get all sales (with filters)
// @route  GET /api/sales
exports.getSales = async (req, res) => {
  try {
    const { district, pharmacy, medicine, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'pharmacy') {
      query.pharmacy = req.user.pharmacy?._id || req.user.pharmacy;
    } else {
      if (pharmacy) query.pharmacy = pharmacy;
      if (district) query.district = district;
    }

    if (medicine) query.medicine = medicine;
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate('medicine', 'name genericName category diseases')
      .populate('pharmacy', 'name district')
      .populate('recordedBy', 'name')
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: sales.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: sales
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update sale
// @route  PUT /api/sales/:id
exports.updateSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('medicine pharmacy');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, data: sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete sale
// @route  DELETE /api/sales/:id
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    createLog({ user: req.user, action: 'DELETE', resource: 'Sale', resourceId: req.params.id, description: `Deleted sale record`, req });
    res.json({ success: true, message: 'Sale deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Export sales as CSV
// @route  GET /api/sales/export
exports.exportSalesCSV = async (req, res) => {
  try {
    const { district, startDate, endDate, medicine } = req.query;
    const query = {};

    if (req.user.role === 'pharmacy') {
      query.pharmacy = req.user.pharmacy?._id || req.user.pharmacy;
    } else {
      if (district) query.district = district;
    }
    if (medicine) query.medicine = medicine;
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .populate('medicine', 'name genericName category')
      .populate('pharmacy', 'name district')
      .populate('recordedBy', 'name')
      .sort({ saleDate: -1 })
      .limit(10000);

    const escape = (v) => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const headers = ['Date','Pharmacy','District','Medicine','Generic Name','Category','Qty','Unit Price (LKR)','Total (LKR)','Prescription','Patient Age','Patient Gender','Batch No','Recorded By'];
    const rows = sales.map(s => [
      s.saleDate ? new Date(s.saleDate).toISOString().substring(0, 10) : '',
      escape(s.pharmacy?.name),
      escape(s.district),
      escape(s.medicine?.name),
      escape(s.medicine?.genericName),
      escape(s.medicine?.category),
      s.quantity,
      s.unitPrice?.toFixed(2),
      s.totalAmount?.toFixed(2),
      s.prescriptionProvided ? 'Yes' : 'No',
      s.patientAge || '',
      s.patientGender || '',
      escape(s.batchNo),
      escape(s.recordedBy?.name)
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `meditrend-sales-export-${new Date().toISOString().substring(0,10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
