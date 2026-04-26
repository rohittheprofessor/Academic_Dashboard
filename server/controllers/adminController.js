const User = require('../models/User');
const Setting = require('../models/Setting');

// @desc    Get all teachers (pending or approved)
// @route   GET /api/admin/teachers
// @access  Private/Admin
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'Teacher' }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update teacher status (Approve/Reject)
// @route   PUT /api/admin/teachers/:id/status
// @access  Private/Admin
const updateTeacherStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const teacher = await User.findById(req.params.id);

    if (teacher && teacher.role === 'Teacher') {
      teacher.status = status;
      const updatedTeacher = await teacher.save();
      res.json({
        _id: updatedTeacher._id,
        name: updatedTeacher.name,
        status: updatedTeacher.status,
        message: `Teacher status updated to ${status}`
      });
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get global settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update global settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }
    
    // Update fields
    if (req.body.instituteName !== undefined) settings.instituteName = req.body.instituteName;
    if (req.body.passThreshold !== undefined) settings.passThreshold = req.body.passThreshold;
    if (req.body.coThresholds) settings.coThresholds = req.body.coThresholds;
    if (req.body.gradeBoundaries) settings.gradeBoundaries = req.body.gradeBoundaries;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTeachers, updateTeacherStatus, deleteUser, getSettings, updateSettings };
