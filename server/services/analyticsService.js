const { getGrade, getPassFailStatus, assignRanks } = require('./gradingService');
const { calculateStudentCOAttainment, calculateClassCOAttainment } = require('./coService');
const { calculateClassMetrics, calculateQuestionAnalytics } = require('./statsService');

/**
 * Orchestrates the full calculation pipeline for a raw assessment object.
 * Mutates the assessment object in place with all analytics.
 * @param {Object} assessmentData Raw parsed data containing metadata, coMappings, studentRecords
 * @returns {Object} Fully enriched Assessment payload ready for MongoDB save
 */
const processAssessmentAnalytics = async (assessmentData) => {
  const { coMappings, studentRecords } = assessmentData;

  // 1. Process Individual Students (Grades, Pass/Fail, Total %, CO Attainment)
  // Calculate the max possible total marks from coMappings
  const maxPossibleTotal = coMappings.reduce((sum, mapping) => sum + mapping.maxMarks, 0);

  for (let i = 0; i < studentRecords.length; i++) {
    const student = studentRecords[i];
    
    // Ensure total marks and percentage are calculated if missing
    if (student.percentage === undefined || student.percentage === null) {
      student.percentage = maxPossibleTotal > 0 ? Number(((student.totalMarks / maxPossibleTotal) * 100).toFixed(2)) : 0;
    }

    student.grade = await getGrade(student.percentage);
    student.passFailStatus = await getPassFailStatus(student.percentage);
    
    // CO Attainment
    student.coAttainment = calculateStudentCOAttainment(student.marks, coMappings);
  }

  // 2. Assign Ranks (mutates studentRecords)
  assignRanks(studentRecords);

  // 3. Process Class Level Metrics
  const classMetrics = calculateClassMetrics(studentRecords);

  // 4. Process Question Level Analytics
  const questionAnalytics = calculateQuestionAnalytics(studentRecords, coMappings);

  // 5. Process Global CO Attainment
  const coAttainmentSummary = await calculateClassCOAttainment(studentRecords, coMappings);

  // 6. Assemble Final Analytics Object
  assessmentData.analytics = {
    ...classMetrics,
    coAttainmentSummary,
    questionAnalytics
  };

  return assessmentData;
};

module.exports = {
  processAssessmentAnalytics
};
