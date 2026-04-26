const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'UPLOAD_ASSESSMENT', 'APPROVE_TEACHER', 'REJECT_TEACHER', 'UPDATE_SETTINGS', 'DELETE_USER']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: String
  },
  ipAddress: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
