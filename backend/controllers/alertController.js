const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Disease = require('../models/Disease');

// Thresholds for outbreak detection
const OUTBREAK_THRESHOLDS = {
  Critical: 50,
  High: 30,
  Medium: 15,
  Low: 5
};

// @desc   Get outbreak / disease surge alerts
// @route  GET /api/alerts
exports.getAlerts = async (req, res) => {
  try {
    const now = new Date();
    const last30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const prev30 = new Date(now - 60 * 24 * 60 * 60 * 1000);

    // Disease sales in last 30 days vs prev 30 days
    const [recent, previous, topDistricts] = await Promise.all([
      Sale.aggregate([
        { $match: { saleDate: { $gte: last30 } } },
        { $lookup: { from: 'medicines', localField: 'medicine', foreignField: '_id', as: 'med' } },
        { $unwind: '$med' },
        { $unwind: { path: '$med.diseases', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$med.diseases', totalQty: { $sum: '$quantity' }, saleCount: { $sum: 1 } } },
        { $lookup: { from: 'diseases', localField: '_id', foreignField: '_id', as: 'disease' } },
        { $unwind: '$disease' },
        { $project: { disease: '$disease.name', severity: '$disease.severity', category: '$disease.category', isNotifiable: '$disease.isNotifiable', totalQty: 1, saleCount: 1 } }
      ]),
      Sale.aggregate([
        { $match: { saleDate: { $gte: prev30, $lt: last30 } } },
        { $lookup: { from: 'medicines', localField: 'medicine', foreignField: '_id', as: 'med' } },
        { $unwind: '$med' },
        { $unwind: { path: '$med.diseases', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$med.diseases', totalQty: { $sum: '$quantity' } } }
      ]),
      // Top district spikes
      Sale.aggregate([
        { $match: { saleDate: { $gte: last30 } } },
        { $group: { _id: '$district', totalQty: { $sum: '$quantity' }, saleCount: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
        { $sort: { totalQty: -1 } },
        { $limit: 10 }
      ])
    ]);

    const prevMap = {};
    previous.forEach(p => { prevMap[String(p._id)] = p.totalQty; });

    const alerts = recent.map(r => {
      const prev = prevMap[String(r._id)] || 0;
      const change = prev > 0 ? Math.round(((r.totalQty - prev) / prev) * 100) : 100;
      const threshold = OUTBREAK_THRESHOLDS[r.severity] || 10;
      const isAlert = r.totalQty >= threshold || change >= 50;
      return {
        diseaseId: r._id,
        disease: r.disease,
        severity: r.severity,
        category: r.category,
        isNotifiable: r.isNotifiable,
        current30Days: r.totalQty,
        prev30Days: prev,
        percentChange: change,
        isAlert,
        alertLevel: change >= 100 ? 'Critical' : change >= 50 ? 'High' : r.severity
      };
    })
    .filter(a => a.isAlert)
    .sort((a, b) => b.percentChange - a.percentChange);

    // Summary stats
    const criticalCount = alerts.filter(a => a.alertLevel === 'Critical').length;
    const highCount = alerts.filter(a => a.alertLevel === 'High').length;
    const notifiableCount = alerts.filter(a => a.isNotifiable).length;

    res.json({
      success: true,
      summary: { total: alerts.length, critical: criticalCount, high: highCount, notifiable: notifiableCount },
      alerts,
      topDistricts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
