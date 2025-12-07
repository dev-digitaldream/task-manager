const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tasks/:taskId/subtasks - Get all subtasks for a task
router.get('/:taskId/subtasks', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { order: 'asc' }
    });
    
    res.json(subtasks);
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    res.status(500).json({ error: 'Failed to fetch subtasks' });
  }
});

// POST /api/tasks/:taskId/subtasks - Create a new subtask
router.post('/:taskId/subtasks', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Get the max order for existing subtasks
    const maxOrder = await prisma.subtask.aggregate({
      where: { taskId },
      _max: { order: true }
    });
    
    const subtask = await prisma.subtask.create({
      data: {
        content: content.trim(),
        taskId,
        order: (maxOrder._max.order ?? -1) + 1
      }
    });
    
    res.status(201).json(subtask);
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
});

// PATCH /api/tasks/:taskId/subtasks/:subtaskId - Update a subtask (toggle, rename)
router.patch('/:taskId/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { content, completed } = req.body;
    
    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (completed !== undefined) updateData.completed = completed;
    
    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: updateData
    });
    
    res.json(subtask);
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
});

// DELETE /api/tasks/:taskId/subtasks/:subtaskId - Delete a subtask
router.delete('/:taskId/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    
    await prisma.subtask.delete({
      where: { id: subtaskId }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
});

// PATCH /api/tasks/:taskId/subtasks/reorder - Reorder subtasks
router.patch('/:taskId/subtasks/reorder', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { subtaskIds } = req.body; // Array of subtask IDs in new order
    
    if (!Array.isArray(subtaskIds)) {
      return res.status(400).json({ error: 'subtaskIds array required' });
    }
    
    // Update order for each subtask
    await Promise.all(
      subtaskIds.map((id, index) =>
        prisma.subtask.updateMany({
          where: { id, taskId },
          data: { order: index }
        })
      )
    );
    
    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { order: 'asc' }
    });
    
    res.json(subtasks);
  } catch (error) {
    console.error('Error reordering subtasks:', error);
    res.status(500).json({ error: 'Failed to reorder subtasks' });
  }
});

module.exports = router;
