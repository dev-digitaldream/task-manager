const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Login with email/password OR simple name
router.post('/login', async (req, res) => {
  try {
    const { email, password, name, avatar } = req.body;

    // Email/password auth (for demo/production)
    if (email && password) {
      const user = await prisma.user.findFirst({
        where: { email }
      });

      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update online status
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true }
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    }
    // Simple name-based login (for open source version)
    else if (name) {
      let user = await prisma.user.findUnique({
        where: { name }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            avatar: avatar || '👤',
            isOnline: true
          }
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { isOnline: true }
        });
      }

      res.json(user);
    } else {
      res.status(400).json({ error: 'Email/password or name required' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, avatar } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name required' });
    }

    // Check if email exists
    const existing = await prisma.user.findFirst({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        avatar: avatar || '👤',
        isOnline: true
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
