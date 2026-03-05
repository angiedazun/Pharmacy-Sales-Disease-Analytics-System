const express = require('express');
const router = express.Router();
const { getDiseases, getDisease, createDisease, updateDisease, deleteDisease } = require('../controllers/diseaseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getDiseases);
router.get('/:id', getDisease);
router.post('/', authorize('admin'), createDisease);
router.put('/:id', authorize('admin'), updateDisease);
router.delete('/:id', authorize('admin'), deleteDisease);

module.exports = router;
