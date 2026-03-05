const express = require('express');
const router = express.Router();
const { getMedicines, getMedicine, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getMedicines);
router.get('/:id', getMedicine);
router.post('/', authorize('admin'), createMedicine);
router.put('/:id', authorize('admin'), updateMedicine);
router.delete('/:id', authorize('admin'), deleteMedicine);

module.exports = router;
