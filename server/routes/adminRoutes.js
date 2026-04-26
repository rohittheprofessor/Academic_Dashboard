const express = require('express');
const router = express.Router();
const { getTeachers, updateTeacherStatus, deleteUser, getSettings, updateSettings } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');

// All routes here require both protect and admin middleware
router.use(protect);
router.use(admin);

router.route('/teachers')
  .get(getTeachers);

router.route('/teachers/:id/status')
  .put(logAction('APPROVE_TEACHER'), updateTeacherStatus);

router.route('/users/:id')
  .delete(logAction('DELETE_USER'), deleteUser);

router.route('/settings')
  .get(getSettings)
  .put(logAction('UPDATE_SETTINGS'), updateSettings);

module.exports = router;
