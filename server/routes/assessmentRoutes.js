const express = require('express');
const router = express.Router();
const { createAssessment, getAssessments, softDeleteAssessment } = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');

router.route('/')
  .post(protect, logAction('UPLOAD_ASSESSMENT'), createAssessment)
  .get(protect, getAssessments);

router.route('/:id')
  .delete(protect, softDeleteAssessment);

module.exports = router;
