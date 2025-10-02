const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Nom et mot de passe requis' });
    }

    const nameTrim = name.trim();

    // 1) Try exact match (fast via unique index)
    let user = await prisma.user.findUnique({
      where: { name: nameTrim },
      select: { id: true, name: true, password: true, avatar: true }
    });

    // 2) Fallback: case-insensitive match (scan small user list)
    if (!user) {
      const candidates = await prisma.user.findMany({
        select: { id: true, name: true, password: true, avatar: true }
      });
      user = candidates.find(u => u.name.toLowerCase() === nameTrim.toLowerCase()) || null;
    }

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    // Check password (if user has no password, allow login for backward compatibility)
    if (user.password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Mot de passe incorrect' });
      }
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur de connexion' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, password, avatar } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Le nom est obligatoire' });
    }

    if (!password || password.length < 3) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 3 caractères' });
    }

    const nameTrim = name.trim();

    // Check if user already exists (case-insensitive)
    let existingUser = await prisma.user.findUnique({ where: { name: nameTrim } });
    if (!existingUser) {
      const candidates = await prisma.user.findMany({ select: { id: true, name: true } });
      existingUser = candidates.find(u => u.name.toLowerCase() === nameTrim.toLowerCase()) || null;
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Un utilisateur avec ce nom existe déjà' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: nameTrim,
        password: hashedPassword,
        avatar: avatar || '👤'
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// PATCH /api/auth/change-password
router.patch('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'ID utilisateur et nouveau mot de passe requis' });
    }

    if (newPassword.length < 3) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 3 caractères' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Verify current password if user has one
    if (user.password && currentPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
});

// GET /api/auth/users (for admin or user management)
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        isOnline: true,
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
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// PATCH /api/auth/users/:id (edit user)
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        avatar: true,
        isOnline: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà pris' });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
  }
});

module.exports = router;