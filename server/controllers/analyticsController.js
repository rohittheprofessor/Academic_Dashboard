const Assessment = require('../models/Assessment');
const { compareAssessments } = require('../services/comparisonService');

// @desc    Get dashboard overview metrics
// @route   GET /api/analytics/:id/overview
// @access  Private
const getOverview = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).select('metadata analytics');
    if (!assessment) return res.status(404).json({ message: 'Not found' });
    
    // Return high level stats
    const { totalStudents, appearedStudents, absentStudents, averageTotal, highestTotal, lowestTotal, standardDeviation, passPercentage } = assessment.analytics;
    res.json({
      metadata: assessment.metadata,
      totalStudents, appearedStudents, absentStudents, averageTotal, highestTotal, lowestTotal, standardDeviation, passPercentage
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get all student performance records
// @route   GET /api/analytics/:id/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).select('studentRecords');
    if (!assessment) return res.status(404).json({ message: 'Not found' });
    res.json(assessment.studentRecords);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get question level analytics
// @route   GET /api/analytics/:id/questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).select('analytics.questionAnalytics');
    if (!assessment) return res.status(404).json({ message: 'Not found' });
    res.json(assessment.analytics.questionAnalytics);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get global CO attainment stats
// @route   GET /api/analytics/:id/co
// @access  Private
const getCoAttainment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).select('analytics.coAttainmentSummary');
    if (!assessment) return res.status(404).json({ message: 'Not found' });
    res.json(assessment.analytics.coAttainmentSummary);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Compare CT1 and CT2 (Provide target CT2 ID)
// @route   GET /api/analytics/compare/:targetId
// @access  Private
const getComparison = async (req, res) => {
  try {
    const comparisonData = await compareAssessments(req.params.targetId);
    if (!comparisonData) {
      return res.status(200).json({ exists: false, message: 'No baseline assessment found for comparison.' });
    }
    res.json({ exists: true, data: comparisonData });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  getOverview,
  getStudents,
  getQuestions,
  getCoAttainment,
  getComparison
};
