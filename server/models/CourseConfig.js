const mongoose = require('mongoose');

// Groups PO/PSO mapping + CO targets by the same "class context" key
// already used across the app (program, courseId, semester, section, sessionYear).
const DEFAULT_PO_LIST = [
  { id: 'PO1', desc: 'Engineering Knowledge' },
  { id: 'PO2', desc: 'Problem Analysis' },
  { id: 'PO3', desc: 'Design/Development of Solutions' },
  { id: 'PO4', desc: 'Conduct Investigations of Complex Problems' },
  { id: 'PO5', desc: 'Engineering Tool Usage' },
  { id: 'PO6', desc: 'The Engineer and The World' },
  { id: 'PO7', desc: 'Ethics' },
  { id: 'PO8', desc: 'Individual and Collaborative Team work' },
  { id: 'PO9', desc: 'Communication' },
  { id: 'PO10', desc: 'Project Management and Finance' },
  { id: 'PO11', desc: 'Life-Long Learning' },
  { id: 'PSO1', desc: 'Program Specific Outcome 1' },
  { id: 'PSO2', desc: 'Program Specific Outcome 2' },
];

const courseConfigSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Same class-context key used elsewhere (activeClassSession on the client)
  context: {
    program: String,
    courseId: String,
    semester: String,
    section: String,
    sessionYear: String
  },
  // Denominator used for every CO/PO attainment percentage.
  // Mirrors "Number of Students" in the original sheet — may differ from
  // however many student records have actually been uploaded so far.
  numStudents: { type: Number, default: 0 },

  coTargets: {
    type: [Number],
    default: [60, 60, 60, 60, 60] // one target % per CO1..CO5
  },

  poList: {
    type: [{ id: String, desc: String }],
    default: DEFAULT_PO_LIST
  },

  // poMapping.CO1.PO1 = 1|2|3 (mapping strength) or absent/null if not mapped
  poMapping: {
    type: mongoose.Schema.Types.Mixed,
    default: () => Object.fromEntries(
      ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'].map((co) => [co, {}])
    )
  }
}, { timestamps: true });

courseConfigSchema.index(
  { teacher: 1, 'context.program': 1, 'context.courseId': 1, 'context.semester': 1, 'context.section': 1, 'context.sessionYear': 1 },
  { unique: true }
);

module.exports = mongoose.model('CourseConfig', courseConfigSchema);
module.exports.DEFAULT_PO_LIST = DEFAULT_PO_LIST;
