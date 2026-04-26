const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    paperCode: String,
    courseId: String,
    program: String,
    semester: String,
    section: String,
    sessionYear: String,
    testType: {
      type: String,
      enum: ['CT', 'Makeup', 'Internal', 'External', 'Other'],
      default: 'CT'
    },
    examSequence: { type: Number, default: 1 }, // CT1 -> 1, CT2 -> 2
    testName: String
  },
  coMappings: [{
    questionNo: { type: String, required: true }, // e.g., 'Q1'
    co: { type: String, enum: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'], required: true },
    maxMarks: { type: Number, required: true }
  }],
  studentRecords: [{
    sNo: Number,
    studentId: String,
    rollNo: String,
    name: String,
    marks: {
      type: Map,
      of: Number // Map key is questionNo, value is marks obtained
    },
    totalMarks: Number,
    percentage: Number,
    
    // Calculated Analytics cached per student
    rank: Number,
    grade: String,
    passFailStatus: String,
    coAttainment: {
      type: Map,
      of: Number // { 'CO1': 80.0, 'CO2': 50.0 }
    }
  }],
  // Global Calculated Metrics cached for the entire class
  analytics: {
    totalStudents: Number,
    appearedStudents: Number,
    absentStudents: Number,
    averageTotal: Number,
    medianTotal: Number,
    highestTotal: Number,
    lowestTotal: Number,
    standardDeviation: Number,
    passPercentage: Number,

    // CO Attainment Array
    coAttainmentSummary: [{
      co: String,
      averagePercentage: Number,
      status: String // Achieved, Moderate, Weak
    }],

    // Question Difficulty Array
    questionAnalytics: [{
      questionNo: String,
      averageScore: Number,
      maxMarks: Number,
      difficultyIndex: Number,
      weakFlag: Boolean
    }]
  },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
