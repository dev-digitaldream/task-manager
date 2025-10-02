const express = require('express');
const { default: ical } = require('ical-generator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/:userId/tasks.ics - Export tasks as iCalendar
router.get('/users/:userId/tasks.ics', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch user's tasks (owned or assigned)
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { assigneeId: userId }
        ]
      },
      include: {
        assignee: {
          select: { name: true, avatar: true }
        },
        owner: {
          select: { name: true, avatar: true }
        }
      }
    });

    // Create calendar
    const calendar = ical({
      name: `Tâches de ${user.name}`,
      description: 'Tâches synchronisées depuis Todo Collaboratif',
      timezone: 'Europe/Paris',
      prodId: {
        company: 'Rauwers Cloud',
        product: 'Todo Collaboratif',
        language: 'FR'
      }
    });

    // Add tasks as VTODO items
    tasks.forEach(task => {
      const todo = calendar.createEvent({
        uid: `task-${task.id}@task-manager.digitaldream.work`,
        summary: task.title,
        start: task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt),
        created: new Date(task.createdAt),
        lastModified: new Date(task.updatedAt)
      });

      // Set description with details
      const details = [];
      if (task.assignee) {
        details.push(`Assigné à: ${task.assignee.avatar} ${task.assignee.name}`);
      }
      if (task.owner) {
        details.push(`Propriétaire: ${task.owner.avatar} ${task.owner.name}`);
      }
      details.push(`Priorité: ${task.priority || 'medium'}`);
      details.push(`Statut: ${task.status}`);
      if (task.clientApproval && task.clientApproval !== 'none') {
        details.push(`Approbation client: ${task.clientApproval}`);
      }
      if (task.approvalComment) {
        details.push(`Commentaire: ${task.approvalComment}`);
      }

      todo.description(details.join('\n'));

      // Set category based on status
      todo.categories([{
        name: task.status === 'todo' ? 'À faire' : task.status === 'doing' ? 'En cours' : 'Terminé'
      }]);

      // Set priority (1=high, 5=medium, 9=low in iCal spec)
      const priorityMap = {
        urgent: 1,
        high: 3,
        medium: 5,
        low: 9
      };
      todo.priority(priorityMap[task.priority] || 5);

      // Mark as completed if done
      if (task.status === 'done') {
        todo.status('COMPLETED');
        todo.completed(new Date(task.updatedAt));
      } else {
        todo.status('NEEDS-ACTION');
      }

      // Add URL to task
      todo.url(`https://task-manager.digitaldream.work/app#task-${task.id}`);
    });

    // Set headers for iCalendar response
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${user.name}-tasks.ics"`);

    // Send calendar
    res.send(calendar.toString());

  } catch (error) {
    console.error('Error generating iCalendar:', error);
    res.status(500).json({ error: 'Failed to generate calendar' });
  }
});

module.exports = router;
