const express = require('express');
const router = express.Router();
const { createSale, getSales, updateSale, deleteSale, exportSalesCSV } = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/export', exportSalesCSV);
router.get('/', getSales);
router.post('/', createSale);
router.put('/:id', authorize('admin', 'pharmacy'), updateSale);
router.delete('/:id', authorize('admin'), deleteSale);

module.exports = router;
