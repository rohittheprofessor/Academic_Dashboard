/**
 * Math utility for Standard Deviation
 */
const calculateStandardDeviation = (totals, average) => {
  if (totals.length === 0) return 0;
  const squareDiffs = totals.map(value => {
    const diff = value - average;
    return diff * diff;
  });
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Number(Math.sqrt(avgSquareDiff).toFixed(2));
};

/**
 * Computes class-level statistics (Average, Median, Highest, Lowest, SD)
 * @param {Array} studentRecords 
 * @param {Number} passingCount 
 * @returns {Object} Class analytics metrics
 */
const calculateClassMetrics = (studentRecords) => {
  const totals = studentRecords.map(s => s.totalMarks).filter(val => val !== null && !isNaN(val));
  const totalStudents = studentRecords.length;
  
  // Count absent (assuming 0 total and 0 percentage means absent, but better logic is required based on ERP flag. We use a heuristic here)
  const absentStudents = studentRecords.filter(s => s.percentage === 0 && s.totalMarks === 0).length;
  const appearedStudents = totalStudents - absentStudents;

  // Passing logic relies on the studentRecords already having passFailStatus
  const passedStudents = studentRecords.filter(s => s.passFailStatus === 'Pass').length;
  const passPercentage = appearedStudents > 0 ? Number(((passedStudents / appearedStudents) * 100).toFixed(2)) : 0;

  if (totals.length === 0) return {
    totalStudents, appearedStudents, absentStudents,
    averageTotal: 0, medianTotal: 0, highestTotal: 0, lowestTotal: 0, standardDeviation: 0, passPercentage: 0
  };

  const highestTotal = Math.max(...totals);
  const lowestTotal = Math.min(...totals);
  
  const sum = totals.reduce((a, b) => a + b, 0);
  const averageTotal = Number((sum / totals.length).toFixed(2));

  // Median
  const sortedTotals = [...totals].sort((a, b) => a - b);
  const mid = Math.floor(sortedTotals.length / 2);
  const medianTotal = sortedTotals.length % 2 !== 0 
      ? sortedTotals[mid] 
      : Number(((sortedTotals[mid - 1] + sortedTotals[mid]) / 2).toFixed(2));

  const standardDeviation = calculateStandardDeviation(totals, averageTotal);

  return {
    totalStudents,
    appearedStudents,
    absentStudents,
    averageTotal,
    medianTotal,
    highestTotal,
    lowestTotal,
    standardDeviation,
    passPercentage
  };
};

/**
 * Computes Question Level Analytics (Average score, difficulty index)
 * @param {Array} studentRecords 
 * @param {Array} coMappings 
 */
const calculateQuestionAnalytics = (studentRecords, coMappings) => {
  const qStats = [];

  coMappings.forEach(mapping => {
    const { questionNo, maxMarks, bloomsLevel = 'K3' } = mapping;
    
    let totalScore = 0;
    let attemptedCount = 0;

    studentRecords.forEach(student => {
      const mark = student.marks[questionNo];
      // Only count if they attempted it (some ERPs might have null, but 0 is tricky if it's actually 0 or just unattempted. Assuming 0 is attempted for now).
      if (mark !== undefined && mark !== null) {
        totalScore += Number(mark);
        attemptedCount++;
      }
    });

    const averageScore = attemptedCount > 0 ? Number((totalScore / attemptedCount).toFixed(2)) : 0;
    const difficultyIndex = maxMarks > 0 ? Number((averageScore / maxMarks).toFixed(2)) : 0;
    
    // Flag as weak if class average for this question is below 40% of its max marks
    const weakFlag = difficultyIndex < 0.4;

    qStats.push({
      questionNo,
      averageScore,
      maxMarks,
      difficultyIndex,
      weakFlag,
      bloomsLevel
    });
  });

  return qStats;
};

module.exports = {
  calculateClassMetrics,
  calculateQuestionAnalytics
};
