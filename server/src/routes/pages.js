const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all pages for a user
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const pages = await prisma.page.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a page
router.post('/', async (req, res) => {
    try {
        const { title, content, userId, workspaceId } = req.body;
        
        const page = await prisma.page.create({
            data: {
                title,
                content: content || '',
                userId,
                workspaceId: workspaceId || null
            }
        });
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a page
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, isPublic } = req.body;
        
        const page = await prisma.page.update({
            where: { id },
            data: {
                title,
                content,
                isPublic
            }
        });
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a page
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.page.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
