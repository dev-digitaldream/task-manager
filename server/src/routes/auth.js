const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const prisma = new PrismaClient();

// Helper to generate secure random token
const generateToken = () => crypto.randomBytes(32).toString('hex');

// Helper to generate session token
const generateSessionToken = () => crypto.randomBytes(48).toString('base64url');

// Session expiry duration (7 days)
const SESSION_EXPIRY_DAYS = 7;

// ========================================
// LOGIN
// ========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password, name, avatar, twoFactorCode } = req.body;

    // Email/password auth (secure mode)
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

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.status(200).json({ 
            requiresTwoFactor: true, 
            userId: user.id,
            message: 'Two-factor authentication required'
          });
        }

        // Verify 2FA code
        const isValidCode = authenticator.verify({
          token: twoFactorCode,
          secret: user.twoFactorSecret
        });

        // Check backup codes if TOTP fails
        if (!isValidCode) {
          const backupCodes = user.backupCodes ? JSON.parse(user.backupCodes) : [];
          const codeIndex = backupCodes.indexOf(twoFactorCode);
          
          if (codeIndex === -1) {
            return res.status(401).json({ error: 'Invalid 2FA code' });
          }
          
          // Remove used backup code
          backupCodes.splice(codeIndex, 1);
          await prisma.user.update({
            where: { id: user.id },
            data: { backupCodes: JSON.stringify(backupCodes) }
          });
        }
      }

      // Create session
      const sessionToken = generateSessionToken();
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          expiresAt: new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        }
      });

      // Update online status
      await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true }
      });

      const { password: _, twoFactorSecret, backupCodes, resetToken, ...userWithoutSensitive } = user;
      res.json({ 
        user: userWithoutSensitive, 
        sessionToken,
        expiresAt: session.expiresAt
      });
    }
    // Simple name-based login (open source mode)
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

      res.json({ user });
    } else {
      res.status(400).json({ error: 'Email/password or name required' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ========================================
// REGISTER
// ========================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, avatar } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name required' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if email exists
    const existingEmail = await prisma.user.findFirst({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check if username exists
    const existingName = await prisma.user.findUnique({
      where: { name }
    });

    if (existingName) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Generate email verification token
    const emailVerifyToken = generateToken();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        avatar: avatar || '👤',
        isOnline: true,
        emailVerifyToken,
        emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    // TODO: Send verification email
    console.log(`📧 Verification link: /api/auth/verify-email?token=${emailVerifyToken}`);

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ 
      user: userWithoutPassword,
      message: 'Account created! Please check your email to verify.'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ========================================
// VERIFY EMAIL
// ========================================
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null
      }
    });

    res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ========================================
// FORGOT PASSWORD (Request Reset)
// ========================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await prisma.user.findFirst({
      where: { email }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = generateToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }
    });

    // TODO: Send reset email with nodemailer
    console.log(`📧 Password reset link: /reset-password?token=${resetToken}`);

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});

// ========================================
// RESET PASSWORD
// ========================================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    // Invalidate all existing sessions
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });

    res.json({ message: 'Password reset successfully! Please login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// ========================================
// LOGOUT
// ========================================
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      const session = await prisma.session.findUnique({
        where: { token }
      });

      if (session) {
        await prisma.session.delete({
          where: { id: session.id }
        });

        await prisma.user.update({
          where: { id: session.userId },
          data: { isOnline: false }
        });
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ========================================
// GET CURRENT USER (from session)
// ========================================
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Session expired' });
    }

    const { password, twoFactorSecret, backupCodes, resetToken, ...userWithoutSensitive } = session.user;
    res.json({ user: userWithoutSensitive });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ========================================
// 2FA: SETUP
// ========================================
router.post('/2fa/setup', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate secret
    const secret = authenticator.generateSecret();
    
    // Generate OTP Auth URL
    const otpauth = authenticator.keyuri(user.email || user.name, 'FlowSpaces', secret);
    
    // Generate QR Code
    const qrCode = await QRCode.toDataURL(otpauth);
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Save secret temporarily (will be finalized on verification)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        backupCodes: JSON.stringify(backupCodes)
      }
    });

    res.json({ 
      qrCode, 
      secret,
      backupCodes,
      message: 'Scan QR code with your authenticator app'
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: '2FA setup failed' });
  }
});

// ========================================
// 2FA: VERIFY AND ENABLE
// ========================================
router.post('/2fa/verify', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and code required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA not set up' });
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });

    res.json({ message: 'Two-factor authentication enabled!' });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ error: '2FA verification failed' });
  }
});

// ========================================
// 2FA: DISABLE
// ========================================
router.post('/2fa/disable', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and password required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null
      }
    });

    res.json({ message: 'Two-factor authentication disabled' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: '2FA disable failed' });
  }
});

// ========================================
// CHANGE PASSWORD
// ========================================
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
});

module.exports = router;
