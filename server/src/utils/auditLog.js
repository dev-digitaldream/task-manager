const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Log a task action to the audit trail
 * @param {string} taskId - Task ID
 * @param {string} userId - User ID who performed the action
 * @param {string} action - Action type (created, updated, deleted, status_changed, etc.)
 * @param {string|null} field - Field that changed
 * @param {string|null} oldValue - Previous value
 * @param {string|null} newValue - New value
 */
async function logTaskAction(taskId, userId, action, field = null, oldValue = null, newValue = null) {
  try {
    await prisma.auditLog.create({
      data: {
        taskId,
        userId,
        action,
        field,
        oldValue: oldValue ? String(oldValue) : null,
        newValue: newValue ? String(newValue) : null
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Compare old and new task objects and log changes
 * @param {object} oldTask - Previous task state
 * @param {object} newTask - New task state
 * @param {string} userId - User ID who made the change
 */
async function logTaskChanges(oldTask, newTask, userId) {
  const changes = [];

  // Check each field for changes
  if (oldTask.title !== newTask.title) {
    changes.push({ field: 'title', oldValue: oldTask.title, newValue: newTask.title });
  }

  if (oldTask.status !== newTask.status) {
    changes.push({ field: 'status', oldValue: oldTask.status, newValue: newTask.status });
  }

  if (oldTask.assigneeId !== newTask.assigneeId) {
    const oldName = oldTask.assignee?.name || 'Non assigné';
    const newName = newTask.assignee?.name || 'Non assigné';
    changes.push({ field: 'assignee', oldValue: oldName, newValue: newName });
  }

  if (oldTask.priority !== newTask.priority) {
    changes.push({ field: 'priority', oldValue: oldTask.priority, newValue: newTask.priority });
  }

  if (oldTask.dueDate !== newTask.dueDate) {
    changes.push({
      field: 'dueDate',
      oldValue: oldTask.dueDate ? new Date(oldTask.dueDate).toISOString() : null,
      newValue: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null
    });
  }

  if (oldTask.isPublic !== newTask.isPublic) {
    changes.push({ field: 'isPublic', oldValue: String(oldTask.isPublic), newValue: String(newTask.isPublic) });
  }

  if (oldTask.clientApproval !== newTask.clientApproval) {
    changes.push({ field: 'clientApproval', oldValue: oldTask.clientApproval, newValue: newTask.clientApproval });
  }

  // Log all changes
  for (const change of changes) {
    await logTaskAction(
      newTask.id,
      userId,
      'updated',
      change.field,
      change.oldValue,
      change.newValue
    );
  }
}

module.exports = {
  logTaskAction,
  logTaskChanges
};
