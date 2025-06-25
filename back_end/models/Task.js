const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ['pabeigts', 'nepabeigts'], default: 'nepabeigts' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sharedWith: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['view', 'edit'], default: 'view' }
    }
  ],
  comments: [
    {
      text: String,
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  history: [
    {
      action: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      details: mongoose.Schema.Types.Mixed
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
