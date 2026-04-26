const express = require('express');
const router = express.Router();
const { getOverview, getStudents, getQuestions, getCoAttainment, getComparison } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes protected

router.get('/:id/overview', getOverview);
router.get('/:id/students', getStudents);
router.get('/:id/questions', getQuestions);
router.get('/:id/co', getCoAttainment);
router.get('/compare/:targetId', getComparison);

module.exports = router;
