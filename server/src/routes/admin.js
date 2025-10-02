const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is admin (simple check for now)
// In production, this would verify JWT or session with admin role
const requireAdmin = async (req, res, next) => {
  // For now, we'll accept admin operations
  // TODO: Add proper authentication middleware
  next();
};

// POST /api/admin/users - Create a new user (admin only)
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { name, avatar, isAdmin } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return res.status(400).json({ error: 'User with this name already exists' });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        avatar: avatar || '👤',
        isAdmin: !!isAdmin
      },
      include: {
        _count: {
          select: {
            assignedTasks: true,
            ownedTasks: true
          }
        }
      }
    });

    // Emit socket event to update user list
    const io = req.app.get('io');
    io.emit('users:updated');

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// DELETE /api/admin/users/:id - Delete a user (admin only)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has tasks
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assignedTasks: true,
            ownedTasks: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Unassign tasks before deleting
    await prisma.task.updateMany({
      where: { assigneeId: id },
      data: { assigneeId: null }
    });

    // Delete owned tasks or reassign them
    await prisma.task.updateMany({
      where: { ownerId: id },
      data: { ownerId: null }
    });

    // Delete user's comments
    await prisma.comment.deleteMany({
      where: { authorId: id }
    });

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    // Emit socket event
    const io = req.app.get('io');
    io.emit('users:updated');
    io.emit('tasks:updated');

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PATCH /api/admin/users/:id/admin - Toggle admin status (admin only)
router.patch('/users/:id/admin', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isAdmin: !!isAdmin },
      include: {
        _count: {
          select: {
            assignedTasks: true,
            ownedTasks: true
          }
        }
      }
    });

    // Emit socket event
    const io = req.app.get('io');
    io.emit('users:updated');

    res.json(user);
  } catch (error) {
    console.error('Error updating user admin status:', error);
    res.status(500).json({ error: 'Failed to update user admin status' });
  }
});

module.exports = router;
