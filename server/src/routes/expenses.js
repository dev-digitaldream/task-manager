const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/expenses
router.get('/', async (req, res) => {
    try {
        const { userId, status, workspaceId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'UserId is required' });
        }

        const where = { userId };
        if (status) where.status = status;
        if (workspaceId) where.workspaceId = workspaceId;

        const expenses = await prisma.expense.findMany({
            where,
            orderBy: { date: 'desc' }
        });

        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// GET /api/expenses/stats
router.get('/stats', async (req, res) => {
    try {
        const { userId, workspaceId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'UserId is required' });
        }

        const where = { userId };
        if (workspaceId) where.workspaceId = workspaceId;

        const pending = await prisma.expense.aggregate({
            where: { ...where, status: 'pending' },
            _sum: { amount: true }
        });

        const reimbursed = await prisma.expense.aggregate({
            where: { ...where, status: 'reimbursed' },
            _sum: { amount: true }
        });

        res.json({
            pending: pending._sum.amount || 0,
            reimbursed: reimbursed._sum.amount || 0,
            total: (pending._sum.amount || 0) + (reimbursed._sum.amount || 0)
        });
    } catch (error) {
        console.error('Error fetching expense stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// POST /api/expenses
router.post('/', async (req, res) => {
    try {
        const { description, amount, category, date, userId, workspaceId } = req.body;

        if (!description || !amount || !userId) {
            return res.status(400).json({ error: 'Description, amount and userId are required' });
        }

        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                category: category || 'other',
                date: date ? new Date(date) : new Date(),
                userId,
                workspaceId, // Optional
                status: 'pending'
            }
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// PATCH /api/expenses/:id
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, description, amount, category, date } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (description) updateData.description = description;
        if (amount) updateData.amount = parseFloat(amount);
        if (category) updateData.category = category;
        if (date) updateData.date = new Date(date);

        const expense = await prisma.expense.update({
            where: { id },
            data: updateData
        });

        res.json(expense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.expense.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

module.exports = router;
