const express = require('express');
const { PrismaClient } = require('@prisma/client');
const notificationService = require('../services/notifications');
const { logTaskAction, logTaskChanges } = require('../utils/auditLog');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true }
        },
        owner: {
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
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, assigneeId, ownerId, dueDate, priority, clientApproval, approvalComment, isPublic, publicSummary, isRecurring, recurrencePattern } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Create recurrence rule if needed
    let recurrenceRule = null;
    if (isRecurring && recurrencePattern) {
      const recurringService = require('../services/recurring');
      recurrenceRule = recurringService.createRRule(recurrencePattern);
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        assigneeId: assigneeId || null,
        ownerId: ownerId || assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        // Optional new fields fall back to schema defaults if undefined
        priority: priority || undefined,
        clientApproval: clientApproval || undefined,
        approvalComment: approvalComment || undefined,
        isPublic: isPublic === true,
        publicSummary: publicSummary || undefined,
        isRecurring: isRecurring === true,
        recurrenceRule
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true }
        },
        owner: {
          select: { id: true, name: true, avatar: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    });

    // Log creation
    await logTaskAction(task.id, ownerId || assigneeId, 'created');

    // Emit to all clients
    const io = req.app.get('io');
    io.emit('task:created', task);

    // Send notification if task is assigned
    if (task.assignee && task.assignee.id !== task.ownerId) {
      notificationService.sendTaskAssigned(task, task.assignee).catch(err =>
        console.error('Failed to send assignment notification:', err)
      );
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, assigneeId, ownerId, dueDate, priority, clientApproval, approvalComment, isPublic, publicSummary } = req.body;

    // Get old task to detect status change
    const oldTask = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        owner: { select: { id: true, name: true, avatar: true } }
      }
    });

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (status !== undefined) updateData.status = status;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (ownerId !== undefined) updateData.ownerId = ownerId;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (clientApproval !== undefined) updateData.clientApproval = clientApproval;
    if (approvalComment !== undefined) updateData.approvalComment = approvalComment;
    if (isPublic !== undefined) updateData.isPublic = !!isPublic;
    if (publicSummary !== undefined) updateData.publicSummary = publicSummary;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true }
        },
        owner: {
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
      }
    });

    // Log changes
    const userId = task.assigneeId || task.ownerId;
    if (oldTask && userId) {
      await logTaskChanges(oldTask, task, userId);
    }

    // Emit to all clients
    const io = req.app.get('io');
    io.emit('task:updated', task);

    // Send notification if task completed
    if (status === 'done' && oldTask?.status !== 'done' && task.owner) {
      notificationService.sendTaskCompleted(task, task.owner).catch(err =>
        console.error('Failed to send completion notification:', err)
      );
    }

    // Send notification if newly assigned
    if (assigneeId && oldTask?.assigneeId !== assigneeId && task.assignee) {
      notificationService.sendTaskAssigned(task, task.assignee).catch(err =>
        console.error('Failed to send assignment notification:', err)
      );
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id }
    });

    // Emit to all clients
    const io = req.app.get('io');
    io.emit('task:deleted', id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// POST /api/tasks/:id/comments
router.post('/:id/comments', async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { content, authorId } = req.body;

    if (!content?.trim() || !authorId) {
      return res.status(400).json({ error: 'Content and author are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        taskId,
        authorId
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Get updated task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true, email: true, notifyOnComment: true }
        },
        owner: {
          select: { id: true, name: true, avatar: true, email: true, notifyOnComment: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Emit to all clients
    const io = req.app.get('io');
    io.emit('task:updated', task);

    // Send notification to relevant users (assignee and owner, but not the comment author)
    const recipients = [];
    if (task.assignee && task.assignee.id !== authorId) {
      recipients.push(task.assignee);
    }
    if (task.owner && task.owner.id !== authorId && task.owner.id !== task.assignee?.id) {
      recipients.push(task.owner);
    }

    if (recipients.length > 0) {
      notificationService.sendNewComment(task, comment, recipients).catch(err =>
        console.error('Failed to send comment notification:', err)
      );
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// PATCH /api/tasks/:id/visibility - toggle public visibility (owner-only in future)
router.patch('/:id/visibility', async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic, publicSummary } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        isPublic: !!isPublic,
        publicSummary: publicSummary !== undefined ? publicSummary : undefined,
      },
      select: {
        id: true,
        title: true,
        publicSummary: true,
        isPublic: true,
        status: true,
        priority: true,
        dueDate: true,
        assignee: { select: { id: true, name: true, avatar: true } },
        // owner can be re-enabled if needed
      },
    });

    const io = req.app.get('io');
    io.emit('tasks:public_updated');

    res.json(task);
  } catch (error) {
    console.error('Error updating task visibility:', error);
    res.status(500).json({ error: 'Failed to update task visibility' });
  }
});

// GET /api/tasks/public - public-safe list for dashboard
router.get('/public', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        title: true,
        publicSummary: true,
        status: true,
        priority: true,
        dueDate: true,
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const safe = tasks.map((t) => ({
      id: t.id,
      title: t.publicSummary || t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignee: t.assignee,
    }));

    res.json(safe);
  } catch (error) {
    console.error('Error fetching public tasks:', error);
    res.status(500).json({ error: 'Failed to fetch public tasks' });
  }
});

// GET /api/tasks/:id/history - Get audit log for a task
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: { taskId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({ error: 'Failed to fetch task history' });
  }
});

// POST /api/tasks/:id/claim - Claim a public task (for non-authenticated users)
router.post('/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Find or create temporary user
    let user = await prisma.user.findUnique({
      where: { name: name.trim() }
    });

    if (!user) {
      // Create temporary user with first available emoji avatar
      const emojis = ['👨', '👩', '🧑', '👤', '🙋', '🙋‍♂️', '🙋‍♀️', '🧔', '👨‍💼', '👩‍💼'];
      const existingUsers = await prisma.user.findMany();
      const usedEmojis = new Set(existingUsers.map(u => u.avatar));
      const availableEmoji = emojis.find(e => !usedEmojis.has(e)) || emojis[0];

      user = await prisma.user.create({
        data: {
          name: name.trim(),
          avatar: availableEmoji,
          // Store email in password field as metadata (not for auth)
          password: email?.trim() || null
        }
      });
    }

    // Update task to assign to this user
    const task = await prisma.task.update({
      where: { id },
      data: { assigneeId: user.id },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true }
        },
        owner: {
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
      }
    });

    // Log the claim action
    await logTaskAction(id, user.id, 'claimed', 'assignee', null, user.id);

    // Emit socket event
    const io = req.app.get('io');
    io.emit('task:updated', task);
    io.emit('tasks:public_updated');

    res.json(task);
  } catch (error) {
    console.error('Error claiming task:', error);
    res.status(500).json({ error: 'Failed to claim task' });
  }
});

module.exports = router;