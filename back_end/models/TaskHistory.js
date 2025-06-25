const mongoose = require('mongoose');

const taskHistorySchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  action: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('TaskHistory', taskHistorySchema);