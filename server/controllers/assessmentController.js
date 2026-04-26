const Assessment = require('../models/Assessment');
const { processAssessmentAnalytics } = require('../services/analyticsService');

// @desc    Upload and Analyze new Assessment
// @route   POST /api/assessments
// @access  Private (Teacher)
const createAssessment = async (req, res) => {
  try {
    const { metadata, coMappings, studentRecords } = req.body;

    // Orchestrate the math pipeline
    const enrichedData = await processAssessmentAnalytics({
      metadata,
      coMappings,
      studentRecords
    });

    const assessment = await Assessment.create({
      teacher: req.user._id,
      ...enrichedData
    });

    res.status(201).json({
      message: 'Assessment analyzed and saved successfully',
      assessmentId: assessment._id
    });
  } catch (error) {
    console.error('Assessment Save Error:', error);
    res.status(500).json({ message: 'Failed to process and save assessment.' });
  }
};

// @desc    Get all assessments for logged in teacher
// @route   GET /api/assessments
// @access  Private
const getAssessments = async (req, res) => {
  try {
    // Optionally filter by class context passed via query params
    const filter = { teacher: req.user._id, isDeleted: false };
    if (req.query.sessionYear) filter['metadata.sessionYear'] = req.query.sessionYear;
    if (req.query.courseId) filter['metadata.courseId'] = req.query.courseId;

    const assessments = await Assessment.find(filter).sort({ createdAt: -1 }).select('-studentRecords');
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft Delete an assessment
// @route   DELETE /api/assessments/:id
// @access  Private (Teacher)
const softDeleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found or unauthorized' });
    }

    assessment.isDeleted = true;
    await assessment.save();

    res.json({ message: 'Assessment successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAssessment, getAssessments, softDeleteAssessment };
