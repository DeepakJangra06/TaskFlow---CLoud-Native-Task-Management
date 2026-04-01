const express = require('express');
const Task = require('../models/Task');
const isAuth = require('../middleware/auth');

const router = express.Router();

// Create Task
router.post('/', isAuth, async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      user: req.userId,
    });
    const result = await task.save();
    res.status(201).json({ message: 'Task created successfully', task: result });
  } catch (err) {
    next(err);
  }
});

// Get User Tasks
router.get('/', isAuth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ tasks: tasks });
  } catch (err) {
    next(err);
  }
});

// Update Task
router.put('/:taskId', isAuth, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;

    const result = await task.save();
    res.status(200).json({ message: 'Task updated successfully', task: result });
  } catch (err) {
    next(err);
  }
});

// Delete Task
router.delete('/:taskId', isAuth, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(taskId);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
