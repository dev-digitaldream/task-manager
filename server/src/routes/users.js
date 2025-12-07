const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer pour stocker temporairement en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max (sera réduit après traitement)
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les images
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez JPG, PNG, GIF ou WebP.'));
    }
  }
});

// POST /api/users/:id/avatar - Upload avatar avec redimensionnement
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const filename = `avatar-${id}-${Date.now()}.webp`;
    const filepath = path.join(uploadDir, filename);

    // Redimensionner et optimiser l'image avec sharp
    await sharp(req.file.buffer)
      .resize(200, 200, {
        fit: 'cover',           // Recadrer pour remplir 200x200
        position: 'center'      // Centrer le recadrage
      })
      .webp({ quality: 90 })    // Convertir en WebP avec qualité 90%
      .toFile(filepath);

    const avatarUrl = `/uploads/${filename}`;

    // Supprimer l'ancien avatar s'il existe (sauf si c'est un emoji)
    const oldUser = await prisma.user.findUnique({ where: { id }, select: { avatar: true } });
    if (oldUser?.avatar && oldUser.avatar.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../..', oldUser.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Erreur upload avatar:', error);
    res.status(500).json({ error: 'Échec de l\'upload de l\'avatar' });
  }
});

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

// PATCH /api/users/:id - Update user profile (name, email, avatar)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, avatar } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        isAdmin: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PATCH /api/users/:id/password - Change user password
router.patch('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user has a password set, verify current password
    if (user.password) {
      const valid = await bcrypt.compare(currentPassword || '', user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
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