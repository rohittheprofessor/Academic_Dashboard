const express = require('express');
const router = express.Router();
const { getCourseConfig, updateCourseConfig, getCourseAttainment } = require('../controllers/courseAttainmentController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getCourseConfig)
  .put(protect, updateCourseConfig);

router.route('/attainment')
  .get(protect, getCourseAttainment);

module.exports = router;
