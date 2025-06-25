const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const TaskHistory = require('../models/TaskHistory');
const auth = require('../middleware/auth');

router.use(auth);

// GET /tasks 
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const tasks = await Task.find({
    $or: [
      { userId },
      { 'sharedWith.userId': userId }
    ]
  });
  res.json(tasks);
});

// POST /tasks
router.post('/', async (req, res) => {
  const task = await Task.create({ ...req.body, userId: req.user.id });
  await TaskHistory.create({
    taskId: task._id,
    action: 'add',
    userId: req.user.id,
    timestamp: new Date(),
    details: { title: task.title, description: task.description, status: task.status }
  });
  res.status(201).json(task);
});

// PUT /tasks/:id
router.put('/:id', async (req, res) => {
  const userId = req.user.id;
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Uzdevums nav atrasts' });


  const isOwner = task.userId.equals(userId);
  const shared = task.sharedWith.find(sw => sw.userId.equals(userId) && sw.role === 'edit');
  if (!isOwner && !shared) return res.status(403).json({ error: 'Nav tiesību labot uzdevumu' });

  const oldTask = { ...task.toObject() };

  task.title = req.body.title ?? task.title;
  task.description = req.body.description ?? task.description;
  task.status = req.body.status ?? task.status;
  await task.save();

  await TaskHistory.create({
    taskId: task._id,
    action: 'update',
    userId: userId,
    timestamp: new Date(),
    details: {
      before: oldTask,
      after: {
        title: task.title,
        description: task.description,
        status: task.status
      }
    }
  });

  res.json(task);
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
  if (!task) return res.status(404).json({ error: 'Nav tiesību vai uzdevums nav atrasts' });

  await TaskHistory.create({
    taskId: task._id,
    action: 'delete',
    userId: req.user.id,
    timestamp: new Date(),
    details: { title: task.title, description: task.description, status: task.status }
  });

  await task.deleteOne();
  res.json({ message: 'Dzēsts' });
});

// POST /tasks/:id/comments
router.post('/:id/comments', async (req, res) => {
  const { text } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Uzdevums nav atrasts' });
  if (!(task.userId.equals(req.user.id) || task.sharedWith.some(sw => sw.userId.equals(req.user.id)))) {
    return res.status(403).json({ error: 'Nav tiesību' });
  }
  const comment = await Comment.create({
    taskId: task._id,
    text,
    authorId: req.user.id
  });
  await TaskHistory.create({
    taskId: task._id,
    action: 'comment',
    userId: req.user.id,
    timestamp: new Date(),
    details: { text }
  });
  res.status(201).json(comment);
});

// GET /tasks/:id/comments
router.get('/:id/comments', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Uzdevums nav atrasts' });
  if (!(task.userId.equals(req.user.id) || task.sharedWith.some(sw => sw.userId.equals(req.user.id)))) {
    return res.status(403).json({ error: 'Nav tiesību' });
  }
  const comments = await Comment.find({ taskId: task._id }).sort({ createdAt: 1 });
  res.json(comments);
});

module.exports = router;
