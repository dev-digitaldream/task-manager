const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        isOnline: true,
        isAdmin: true,
        _count: {
          select: {
            assignedTasks: true,
            ownedTasks: true,
            comments: true
          }
        }
      },
      orderBy: [
        { isOnline: 'desc' },
        { name: 'asc' }
      ]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { name, avatar } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { name: name.trim() }
    });

    if (existingUser) {
      return res.json(existingUser);
    }

    // No user limit - removed for future scalability

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        avatar: avatar || null
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// GET /api/users/export
router.get('/export', async (req, res) => {
  try {
    const data = await prisma.task.findMany({
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      totalTasks: data.length,
      tasks: data
    };

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        isOnline: true,
        isAdmin: true,
        email: true,
        notifyOnAssign: true,
        notifyOnComplete: true,
        notifyOnComment: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user by id:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/users/:id/settings - Update user notification settings
router.patch('/:id/settings', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, notifyOnAssign, notifyOnComplete, notifyOnComment } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        email: email || null,
        notifyOnAssign: notifyOnAssign ?? true,
        notifyOnComplete: notifyOnComplete ?? true,
        notifyOnComment: notifyOnComment ?? true
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        isAdmin: true,
        email: true,
        notifyOnAssign: true,
        notifyOnComplete: true,
        notifyOnComment: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove comments authored by this user to avoid FK constraints
    await prisma.comment.deleteMany({ where: { authorId: id } });

    // Unassign any tasks assigned to this user
    await prisma.task.updateMany({
      where: { assigneeId: id },
      data: { assigneeId: null }
    });

    // Unassign any tasks owned by this user
    await prisma.task.updateMany({
      where: { ownerId: id },
      data: { ownerId: null }
    });

    // Finally delete the user
    await prisma.user.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;