const express = require('express');
const router = express.Router();
const {
  runAnalysis,
  getReport,
  getUserReports,
  getAllReports,
  getAdminStats,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.post('/', protect, runAnalysis);
router.get('/user/all', protect, getUserReports);
router.get('/admin/all', protect, adminOnly, getAllReports);
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.get('/:reportId', protect, getReport);

module.exports = router;
