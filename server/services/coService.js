const { getActiveSettings } = require('./gradingService');

/**
 * Evaluates CO status based on percentage
 */
const getCoStatus = async (percentage) => {
  const settings = await getActiveSettings();
  const t = settings.coThresholds;
  
  if (percentage >= t.achieved) return 'Achieved';
  if (percentage >= t.moderate) return 'Moderate';
  return 'Weak';
};

/**
 * Computes individual CO attainment for a single student.
 * @param {Object} studentMarks { 'Q1': 2, 'Q2': 5 }
 * @param {Array} coMappings [{ questionNo: 'Q1', co: 'CO1', maxMarks: 5 }]
 * @returns {Map} Map of CO strings to attainment percentages
 */
const calculateStudentCOAttainment = (studentMarks, coMappings) => {
  const attainment = new Map();
  const coSums = {}; // { 'CO1': { obtained: X, max: Y } }

  coMappings.forEach(mapping => {
    const { questionNo, co, maxMarks } = mapping;
    const obtained = studentMarks[questionNo] || 0; 

    if (!coSums[co]) {
      coSums[co] = { obtained: 0, max: 0 };
    }
    coSums[co].obtained += obtained;
    coSums[co].max += maxMarks;
  });

  Object.keys(coSums).forEach(co => {
    const { obtained, max } = coSums[co];
    const percentage = max > 0 ? (obtained / max) * 100 : 0;
    attainment.set(co, Number(percentage.toFixed(2)));
  });

  return attainment;
};

/**
 * Calculates global CO attainment for the class based on all students' attainments.
 * @param {Array} studentRecords (mutated with coAttainment Map)
 * @param {Array} coMappings 
 * @returns {Array} Array of global CO stats
 */
const calculateClassCOAttainment = async (studentRecords, coMappings) => {
  // Find all unique COs involved
  const uniqueCOs = [...new Set(coMappings.map(m => m.co))];
  const classSummary = [];

  for (let i = 0; i < uniqueCOs.length; i++) {
    const co = uniqueCOs[i];
    let sumPercentage = 0;
    let count = 0;

    studentRecords.forEach(student => {
      const studentPercent = student.coAttainment.get(co);
      if (studentPercent !== undefined) {
        sumPercentage += studentPercent;
        count++;
      }
    });

    const averagePercentage = count > 0 ? Number((sumPercentage / count).toFixed(2)) : 0;
    const status = await getCoStatus(averagePercentage);
    
    classSummary.push({
      co: co,
      averagePercentage: averagePercentage,
      status: status
    });
  }

  return classSummary;
};

module.exports = {
  calculateStudentCOAttainment,
  calculateClassCOAttainment,
  getCoStatus
};
