const CourseConfig = require('../models/CourseConfig');
const { computeCourseAttainment } = require('../services/poAttainmentService');

function contextFromQuery(q) {
  return {
    program: q.program || '',
    courseId: q.courseId || '',
    semester: q.semester || '',
    section: q.section || '',
    sessionYear: q.sessionYear || ''
  };
}

async function getOrCreateConfig(teacherId, context) {
  let config = await CourseConfig.findOne({ teacher: teacherId, context });
  if (!config) {
    config = await CourseConfig.create({ teacher: teacherId, context });
  }
  return config;
}

// @desc    Get PO/PSO mapping + CO targets for a class context (creates a default one if missing)
// @route   GET /api/course-config
// @access  Private
const getCourseConfig = async (req, res) => {
  try {
    const context = contextFromQuery(req.query);
    if (!context.courseId || !context.semester || !context.section || !context.sessionYear) {
      return res.status(400).json({ message: 'program, courseId, semester, section and sessionYear are all required.' });
    }
    const config = await getOrCreateConfig(req.user._id, context);
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update PO/PSO mapping, CO targets, PO descriptions, or numStudents
// @route   PUT /api/course-config
// @access  Private
const updateCourseConfig = async (req, res) => {
  try {
    const context = contextFromQuery(req.query);
    const config = await getOrCreateConfig(req.user._id, context);

    const { numStudents, coTargets, poList, poMapping } = req.body;
    if (numStudents !== undefined) config.numStudents = numStudents;
    if (coTargets !== undefined) config.coTargets = coTargets;
    if (poList !== undefined) config.poList = poList;
    if (poMapping !== undefined) config.poMapping = poMapping;

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get combined CO -> PO/PSO attainment for a class context
// @route   GET /api/course-config/attainment
// @access  Private
const getCourseAttainment = async (req, res) => {
  try {
    const context = contextFromQuery(req.query);
    if (!context.courseId || !context.semester || !context.section || !context.sessionYear) {
      return res.status(400).json({ message: 'program, courseId, semester, section and sessionYear are all required.' });
    }
    const config = await getOrCreateConfig(req.user._id, context);
    const result = await computeCourseAttainment(req.user._id, context, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourseConfig, updateCourseConfig, getCourseAttainment };
