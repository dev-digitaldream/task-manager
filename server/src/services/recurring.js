const { RRule } = require('rrule')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

class RecurringTaskService {
  /**
   * Create instances of recurring tasks based on their recurrence rules
   */
  async generateRecurringInstances() {
    const recurringTasks = await prisma.task.findMany({
      where: {
        isRecurring: true,
        recurrenceRule: { not: null }
      },
      include: {
        assignee: true,
        owner: true
      }
    })

    const now = new Date()
    const lookAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days ahead

    for (const task of recurringTasks) {
      try {
        const rule = RRule.fromString(task.recurrenceRule)
        const occurrences = rule.between(now, lookAhead, true)

        for (const occurrence of occurrences) {
          // Check if instance already exists
          const existing = await prisma.task.findFirst({
            where: {
              parentTaskId: task.id,
              dueDate: occurrence
            }
          })

          if (!existing) {
            // Create new instance
            await prisma.task.create({
              data: {
                title: task.title,
                status: 'todo',
                dueDate: occurrence,
                assigneeId: task.assigneeId,
                ownerId: task.ownerId,
                priority: task.priority,
                isPublic: task.isPublic,
                publicSummary: task.publicSummary,
                parentTaskId: task.id,
                isRecurring: false
              }
            })
            console.log(`✓ Created recurring instance: ${task.title} for ${occurrence.toISOString()}`)
          }
        }
      } catch (error) {
        console.error(`Failed to process recurring task ${task.id}:`, error)
      }
    }
  }

  /**
   * Parse human-friendly recurrence pattern to RRULE
   */
  createRRule(pattern) {
    const patterns = {
      daily: { freq: RRule.DAILY },
      weekly: { freq: RRule.WEEKLY },
      biweekly: { freq: RRule.WEEKLY, interval: 2 },
      monthly: { freq: RRule.MONTHLY },
      yearly: { freq: RRule.YEARLY },
      weekdays: { freq: RRule.DAILY, byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR] }
    }

    const config = patterns[pattern.toLowerCase()] || patterns.weekly
    const rule = new RRule({
      ...config,
      dtstart: new Date()
    })

    return rule.toString()
  }

  /**
   * Start the recurring task scheduler
   */
  startScheduler() {
    // Run every hour
    this.generateRecurringInstances()
    setInterval(() => {
      this.generateRecurringInstances()
    }, 60 * 60 * 1000)

    console.log('🔄 Recurring task scheduler started')
  }
}

module.exports = new RecurringTaskService()
