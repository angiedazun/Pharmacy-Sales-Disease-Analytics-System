const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Disease = require('../models/Disease');
const Pharmacy = require('../models/Pharmacy');

// @desc   Dashboard summary stats
// @route  GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const { district, startDate, endDate } = req.query;

    const matchStage = {};

    // Pharmacy users only see their own pharmacy's data
    if (req.user.role === 'pharmacy') {
      const pharmacyId = req.user.pharmacy?._id || req.user.pharmacy;
      if (pharmacyId) matchStage.pharmacy = pharmacyId;
    } else {
      if (district) matchStage.district = district;
    }

    if (startDate || endDate) {
      matchStage.saleDate = {};
      if (startDate) matchStage.saleDate.$gte = new Date(startDate);
      if (endDate) matchStage.saleDate.$lte = new Date(endDate);
    }

    // Parallel aggregations
    const [
      totalSales, totalRevenue, totalPharmacies, totalMedicines,
      topMedicines, monthlySales
    ] = await Promise.all([
      Sale.countDocuments(matchStage),
      Sale.aggregate([{ $match: matchStage }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Pharmacy.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isActive: true }),

      // Top 10 medicines by quantity
      Sale.aggregate([
        { $match: matchStage },
        { $group: { _id: '$medicine', totalQty: { $sum: '$quantity' }, totalRevenue: { $sum: '$totalAmount' }, saleCount: { $sum: 1 } } },
        { $sort: { totalQty: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'medicines', localField: '_id', foreignField: '_id', as: 'medicine' } },
        { $unwind: '$medicine' },
        { $lookup: { from: 'diseases', localField: 'medicine.diseases', foreignField: '_id', as: 'diseases' } }
      ]),

      // Monthly sales trend (last 12 months)
      Sale.aggregate([
        { $match: { ...matchStage, saleDate: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
        { $group: { _id: { year: { $year: '$saleDate' }, month: { $month: '$saleDate' } }, totalQty: { $sum: '$quantity' }, totalRevenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalSales,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalPharmacies,
        totalMedicines,
        topMedicines,
        monthlySales
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Disease analytics - most common diseases from medicine sales
// @route  GET /api/analytics/diseases
exports.getDiseaseAnalytics = async (req, res) => {
  try {
    const { district, startDate, endDate } = req.query;
    const matchStage = {};
    if (district) matchStage.district = district;
    if (startDate || endDate) {
      matchStage.saleDate = {};
      if (startDate) matchStage.saleDate.$gte = new Date(startDate);
      if (endDate) matchStage.saleDate.$lte = new Date(endDate);
    }

    const diseaseData = await Sale.aggregate([
      { $match: matchStage },
      { $lookup: { from: 'medicines', localField: 'medicine', foreignField: '_id', as: 'medicineData' } },
      { $unwind: '$medicineData' },
      { $unwind: '$medicineData.diseases' },
      { $group: { _id: '$medicineData.diseases', totalQty: { $sum: '$quantity' }, saleCount: { $sum: 1 } } },
      { $sort: { totalQty: -1 } },
      { $limit: 15 },
      { $lookup: { from: 'diseases', localField: '_id', foreignField: '_id', as: 'disease' } },
      { $unwind: '$disease' },
      { $project: { disease: '$disease.name', category: '$disease.category', severity: '$disease.severity', totalQty: 1, saleCount: 1 } }
    ]);

    res.json({ success: true, data: diseaseData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   District heatmap data
// @route  GET /api/analytics/district-heatmap
exports.getDistrictHeatmap = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.saleDate = {};
      if (startDate) matchStage.saleDate.$gte = new Date(startDate);
      if (endDate) matchStage.saleDate.$lte = new Date(endDate);
    }

    const data = await Sale.aggregate([
      { $match: matchStage },
      { $group: { _id: '$district', totalQty: { $sum: '$quantity' }, totalRevenue: { $sum: '$totalAmount' }, saleCount: { $sum: 1 } } },
      { $sort: { totalQty: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Medicine trend (monthly per medicine)
// @route  GET /api/analytics/medicine-trend/:medicineId
exports.getMedicineTrend = async (req, res) => {
  try {
    const data = await Sale.aggregate([
      { $match: { medicine: require('mongoose').Types.ObjectId.createFromHexString(req.params.medicineId) } },
      { $group: { _id: { year: { $year: '$saleDate' }, month: { $month: '$saleDate' } }, totalQty: { $sum: '$quantity' }, totalRevenue: { $sum: '$totalAmount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Disease by district breakdown
// @route  GET /api/analytics/disease-district
exports.getDiseaseByDistrict = async (req, res) => {
  try {
    const { diseaseId } = req.query;
    const matchStage = {};

    const data = await Sale.aggregate([
      { $match: matchStage },
      { $lookup: { from: 'medicines', localField: 'medicine', foreignField: '_id', as: 'medicineData' } },
      { $unwind: '$medicineData' },
      { $unwind: '$medicineData.diseases' },
      ...(diseaseId ? [{ $match: { 'medicineData.diseases': require('mongoose').Types.ObjectId.createFromHexString(diseaseId) } }] : []),
      { $group: { _id: { district: '$district', disease: '$medicineData.diseases' }, totalQty: { $sum: '$quantity' } } },
      { $lookup: { from: 'diseases', localField: '_id.disease', foreignField: '_id', as: 'disease' } },
      { $unwind: '$disease' },
      { $group: { _id: '$_id.district', diseases: { $push: { name: '$disease.name', qty: '$totalQty' } }, totalQty: { $sum: '$totalQty' } } },
      { $sort: { totalQty: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
