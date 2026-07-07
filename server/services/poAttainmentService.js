const Assessment = require('../models/Assessment');

const CO_IDS = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'];

// Which testType buckets feed which part of the attainment formula.
// CIE = internal continuous assessment; SEE = end-semester exam; CES = exit survey.
const CIE_TYPES = ['CT', 'Makeup', 'Internal'];
const SEE_TYPES = ['External'];
const CES_TYPES = ['CES'];

function getMark(marksField, questionNo) {
  if (!marksField) return undefined;
  if (marksField instanceof Map) return marksField.get(questionNo);
  return marksField[questionNo];
}

function level(pct) {
  if (pct === null || pct === undefined || isNaN(pct)) return null;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  return 1;
}

function rollKey(roll) {
  return roll ? String(roll).trim().toUpperCase() : null;
}

/**
 * Combines raw obtained/max marks across a set of assessments (for a given CO),
 * per student, exactly like summing across Sessional-1/Sessional-2/Assignments
 * in the source spreadsheet — not an average of already-finished percentages.
 */
function buildCombinedPctByStudent(assessments, co) {
  // rollKey -> { obtained, max }
  const sums = new Map();
  assessments.forEach((a) => {
    const mappingsForCO = a.coMappings.filter((m) => m.co === co);
    if (mappingsForCO.length === 0) return;
    a.studentRecords.forEach((s) => {
      const key = rollKey(s.rollNo);
      if (!key) return;
      let entry = sums.get(key);
      if (!entry) { entry = { obtained: 0, max: 0 }; sums.set(key, entry); }
      mappingsForCO.forEach((m) => {
        const mark = getMark(s.marks, m.questionNo);
        if (mark !== undefined && mark !== null && mark !== '') {
          entry.obtained += Number(mark);
          entry.max += Number(m.maxMarks) || 0;
        }
      });
    });
  });
  const pctByStudent = new Map();
  sums.forEach((v, key) => {
    pctByStudent.set(key, v.max > 0 ? (v.obtained / v.max) * 100 : null);
  });
  return pctByStudent;
}

function buildSeePctByStudent(seeAssessments) {
  // SEE in the source sheet is one overall % applied to every CO —
  // so we just take each student's overall percentage from the SEE assessment(s).
  const pctByStudent = new Map();
  seeAssessments.forEach((a) => {
    a.studentRecords.forEach((s) => {
      const key = rollKey(s.rollNo);
      if (!key) return;
      if (!pctByStudent.has(key)) pctByStudent.set(key, s.percentage ?? null);
    });
  });
  return pctByStudent;
}

function pctAchievingLevel3(pctByStudent, numStudents) {
  const n = Number(numStudents) || 0;
  if (n === 0) return null;
  let count = 0;
  pctByStudent.forEach((pct) => { if (level(pct) === 3) count++; });
  return Math.round((count / n) * 10000) / 100;
}

/**
 * Full course-level CO -> PO/PSO attainment pipeline.
 */
async function computeCourseAttainment(teacherId, context, config) {
  const filter = {
    teacher: teacherId,
    isDeleted: false,
    'metadata.program': context.program,
    'metadata.courseId': context.courseId,
    'metadata.semester': context.semester,
    'metadata.section': context.section,
    'metadata.sessionYear': context.sessionYear
  };
  const assessments = await Assessment.find(filter);

  const cieAssessments = assessments.filter((a) => CIE_TYPES.includes(a.metadata.testType));
  const seeAssessments = assessments.filter((a) => SEE_TYPES.includes(a.metadata.testType));
  const cesAssessments = assessments.filter((a) => CES_TYPES.includes(a.metadata.testType));

  const seePctByStudent = buildSeePctByStudent(seeAssessments);
  const seeAttained = pctAchievingLevel3(seePctByStudent, config.numStudents);

  const coRows = CO_IDS.map((co, i) => {
    const ciePctByStudent = buildCombinedPctByStudent(cieAssessments, co);
    const cesPctByStudent = buildCombinedPctByStudent(cesAssessments, co);

    const cieAttained = pctAchievingLevel3(ciePctByStudent, config.numStudents);
    const cesAttained = pctAchievingLevel3(cesPctByStudent, config.numStudents);

    const direct = cieAttained !== null && seeAttained !== null
      ? Math.round((0.33 * cieAttained + 0.67 * seeAttained) * 100) / 100
      : null;
    const indirect = cesAttained;
    const overall = direct !== null
      ? Math.round((0.9 * direct + 0.1 * (indirect ?? 0)) * 100) / 100
      : null;
    const onScale3 = overall !== null ? Math.round((overall / 100) * 3 * 100) / 100 : null;
    const target = config.coTargets[i] ?? 60;
    const achieved = overall !== null ? overall > target : null;
    const gap = overall !== null ? Math.round((target - overall) * 100) / 100 : null;

    return { co, cieAttained, seeAttained, cesAttained, direct, indirect, overall, onScale3, target, achieved, gap };
  });

  const poRows = config.poList.map((po) => {
    const strengths = CO_IDS
      .map((co) => config.poMapping?.[co]?.[po.id])
      .filter((v) => v !== '' && v !== undefined && v !== null);

    if (strengths.length === 0) {
      return { id: po.id, desc: po.desc, maxStrength: null, avgAttainment: null, index: null, onScale3: null };
    }
    const maxStrength = Math.max(...strengths.map(Number));
    const relevantOveralls = CO_IDS
      .filter((co) => {
        const v = config.poMapping?.[co]?.[po.id];
        return v !== '' && v !== undefined && v !== null;
      })
      .map((co) => coRows.find((r) => r.co === co)?.overall)
      .filter((v) => v !== null && v !== undefined);

    const avgAttainment = relevantOveralls.length
      ? relevantOveralls.reduce((a, b) => a + b, 0) / relevantOveralls.length
      : null;
    const index = avgAttainment !== null ? Math.round(((maxStrength / 3) * avgAttainment) * 100) / 100 : null;
    const onScale3 = index !== null ? Math.round((index / 100) * 3 * 100) / 100 : null;

    return { id: po.id, desc: po.desc, maxStrength, avgAttainment, index, onScale3 };
  });

  return {
    coRows,
    poRows,
    seeAttained,
    meta: {
      cieAssessmentCount: cieAssessments.length,
      seeAssessmentCount: seeAssessments.length,
      cesAssessmentCount: cesAssessments.length
    }
  };
}

module.exports = { computeCourseAttainment, CO_IDS };
