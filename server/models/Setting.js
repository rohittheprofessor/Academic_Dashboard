const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  instituteName: { type: String, default: 'SmartEval Institute of Technology' },
  passThreshold: { type: Number, default: 40 },
  coThresholds: {
    achieved: { type: Number, default: 70 },
    moderate: { type: Number, default: 50 }
  },
  gradeBoundaries: {
    O: { type: Number, default: 90 },
    A_PLUS: { type: Number, default: 80 },
    A: { type: Number, default: 70 },
    B_PLUS: { type: Number, default: 60 },
    B: { type: Number, default: 50 },
    C: { type: Number, default: 40 }
  }
});

module.exports = mongoose.model('Setting', settingSchema);
