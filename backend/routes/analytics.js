const express = require('express');
const router = express.Router();
const { getDashboardStats, getDiseaseAnalytics, getDistrictHeatmap, getMedicineTrend, getDiseaseByDistrict } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/diseases', getDiseaseAnalytics);
router.get('/district-heatmap', getDistrictHeatmap);
router.get('/medicine-trend/:medicineId', getMedicineTrend);
router.get('/disease-district', getDiseaseByDistrict);

module.exports = router;
