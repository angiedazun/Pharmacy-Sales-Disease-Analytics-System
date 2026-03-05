const express = require('express');
const router = express.Router();
const { getPharmacies, getPharmacy, createPharmacy, updatePharmacy, deletePharmacy } = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getPharmacies);
router.get('/:id', getPharmacy);
router.post('/', authorize('admin'), createPharmacy);
router.put('/:id', authorize('admin'), updatePharmacy);
router.delete('/:id', authorize('admin'), deletePharmacy);

module.exports = router;
