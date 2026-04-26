const Setting = require('../models/Setting');

/**
 * Fetch active settings from DB, fallback to defaults
 */
const getActiveSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) settings = new Setting(); // uses schema defaults
  return settings;
};

/**
 * Determines grade based on percentage and active boundaries
 */
const getGrade = async (percentage) => {
  const settings = await getActiveSettings();
  const b = settings.gradeBoundaries;

  if (percentage >= b.O) return 'O';
  if (percentage >= b.A_PLUS) return 'A+';
  if (percentage >= b.A) return 'A';
  if (percentage >= b.B_PLUS) return 'B+';
  if (percentage >= b.B) return 'B';
  if (percentage >= b.C) return 'C';
  return 'F';
};

/**
 * Determines pass/fail status
 */
const getPassFailStatus = async (percentage) => {
  const settings = await getActiveSettings();
  return percentage >= settings.passThreshold ? 'Pass' : 'Fail';
};

/**
 * Calculates Ranks for an array of student records (handles ties)
 * Mutates the array to inject ranks.
 */
const assignRanks = (studentRecords) => {
  // Sort descending by percentage
  studentRecords.sort((a, b) => b.percentage - a.percentage);

  let currentRank = 1;
  let previousPercentage = null;
  let tieCount = 0;

  for (let i = 0; i < studentRecords.length; i++) {
    const student = studentRecords[i];
    
    // Skip absent students from ranking or rank them last
    if (student.percentage === 0 && student.totalMarks === 0) {
      student.rank = studentRecords.length; // Basically bottom
      continue;
    }

    if (previousPercentage !== null && student.percentage === previousPercentage) {
      // It's a tie, same rank
      student.rank = currentRank;
      tieCount++;
    } else {
      // New rank, jump by tie count
      currentRank += tieCount;
      student.rank = currentRank;
      tieCount = 1; // Reset tie count for next iteration
    }
    
    previousPercentage = student.percentage;
  }

  return studentRecords;
};

module.exports = {
  getGrade,
  getPassFailStatus,
  assignRanks,
  getActiveSettings
};
