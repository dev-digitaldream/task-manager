const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/todos
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'UserId is required' });
        }

        const todos = await prisma.quickTodo.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

// POST /api/todos
router.post('/', async (req, res) => {
    try {
        const { content, userId } = req.body;

        if (!content || !userId) {
            return res.status(400).json({ error: 'Content and userId are required' });
        }

        const todo = await prisma.quickTodo.create({
            data: {
                content,
                userId,
                completed: false
            }
        });

        res.status(201).json(todo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
});

// PATCH /api/todos/:id
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { completed, content } = req.body;

        const updateData = {};
        if (completed !== undefined) updateData.completed = completed;
        if (content !== undefined) updateData.content = content;

        const todo = await prisma.quickTodo.update({
            where: { id },
            data: updateData
        });

        res.json(todo);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Failed to update todo' });
    }
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.quickTodo.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});

module.exports = router;
