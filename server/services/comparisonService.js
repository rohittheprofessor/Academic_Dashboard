const Assessment = require('../models/Assessment');

/**
 * Compares a Target Assessment (e.g. CT2) against a Baseline Assessment (e.g. CT1)
 * Uses the Hybrid Matching Logic defined by User.
 * @param {String} targetAssessmentId 
 * @returns {Object} Comparison analytics or null if no baseline found
 */
const compareAssessments = async (targetAssessmentId) => {
  const target = await Assessment.findById(targetAssessmentId);
  if (!target) throw new Error('Target assessment not found');

  const { courseId, paperCode, semester, section, sessionYear, testType, examSequence } = target.metadata;

  // Hybrid Matching: Must match courseId (if provided) OR paperCode, AND sem, section, session, testType.
  // Exam sequence must be strictly less than target (e.g. CT1 < CT2)
  const query = {
    'metadata.semester': semester,
    'metadata.section': section,
    'metadata.sessionYear': sessionYear,
    'metadata.testType': testType,
    'metadata.examSequence': { $lt: examSequence },
    isDeleted: false
  };

  if (courseId) {
    query['metadata.courseId'] = courseId;
  } else if (paperCode) {
    query['metadata.paperCode'] = paperCode;
  }

  // Find the most recent previous assessment (sort descending by sequence)
  const baseline = await Assessment.findOne(query).sort({ 'metadata.examSequence': -1 });

  if (!baseline) {
    // No CT1 exists, return null to hide charts gracefully
    return null;
  }

  // Map Baseline students by Roll No for O(1) lookup
  const baselineMap = new Map();
  baseline.studentRecords.forEach(s => {
    if (s.rollNo) {
      baselineMap.set(String(s.rollNo).trim().toUpperCase(), s);
    }
  });

  const studentComparisons = [];
  let totalImprovementSum = 0;
  let improverCount = 0;
  let declinedCount = 0;

  target.studentRecords.forEach(tStudent => {
    const rollKey = tStudent.rollNo ? String(tStudent.rollNo).trim().toUpperCase() : null;
    const bStudent = rollKey ? baselineMap.get(rollKey) : null;
    
    if (bStudent) {
      const diff = tStudent.percentage - bStudent.percentage;
      const improved = diff > 0;
      const declined = diff < 0;

      if (improved) improverCount++;
      if (declined) declinedCount++;
      totalImprovementSum += diff;

      studentComparisons.push({
        rollNo: tStudent.rollNo,
        name: tStudent.name,
        baselineScore: bStudent.percentage,
        targetScore: tStudent.percentage,
        improvement: Number(diff.toFixed(2))
      });
    }
  });

  const classImprovementPercent = studentComparisons.length > 0 
    ? Number((totalImprovementSum / studentComparisons.length).toFixed(2)) 
    : 0;

  // Sort to find top improvers
  studentComparisons.sort((a, b) => b.improvement - a.improvement);
  const topImprovers = studentComparisons.slice(0, 5);
  const topDeclined = [...studentComparisons].sort((a, b) => a.improvement - b.improvement).slice(0, 5);

  return {
    baselineId: baseline._id,
    targetId: target._id,
    baselineName: baseline.metadata.testName || `CT${baseline.metadata.examSequence}`,
    targetName: target.metadata.testName || `CT${target.metadata.examSequence}`,
    classImprovementPercent,
    improverCount,
    declinedCount,
    totalCompared: studentComparisons.length,
    topImprovers,
    topDeclined,
    studentComparisons
  };
};

module.exports = {
  compareAssessments
};
