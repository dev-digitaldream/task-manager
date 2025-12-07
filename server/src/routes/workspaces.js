const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendInvitationEmail } = require('../utils/email');
const crypto = require('crypto');
const router = express.Router();
const prisma = new PrismaClient();

// Helper: Generate unique slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + crypto.randomBytes(4).toString('hex');
}

// ===================================
// WORKSPACE CRUD
// ===================================

// GET /api/workspaces - List user's workspaces
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get workspaces where user is member OR owner
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            owner: { select: { id: true, name: true, avatar: true } },
            members: {
              include: {
                user: { select: { id: true, name: true, avatar: true } }
              }
            },
            _count: { select: { tasks: true, members: true } }
          }
        }
      }
    });

    const workspaces = memberships.map(m => ({
      ...m.workspace,
      role: m.role,
      joinedAt: m.joinedAt
    }));

    res.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// GET /api/workspaces/:id - Get workspace details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if user has access
    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true, email: true } }
          }
        },
        _count: { select: { tasks: true, invitations: true } }
      }
    });

    res.json({ ...workspace, userRole: membership.role });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// POST /api/workspaces - Create new workspace
router.post('/', async (req, res) => {
  try {
    const { name, description, logo, userId, currency = 'EUR' } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: 'name and userId are required' });
    }

    const slug = generateSlug(name);

    // Create workspace and add owner as member
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        description,
        logo,
        currency,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner'
          }
        }
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
      }
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// PATCH /api/workspaces/:id - Update workspace
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logo, isPublic, userId, currency } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if user is owner or admin
    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } }
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Only owners and admins can update workspace' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (currency !== undefined) updateData.currency = currency;

    const workspace = await prisma.workspace.update({
      where: { id },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
      }
    });

    res.json(workspace);
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

// DELETE /api/workspaces/:id - Delete workspace (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.ownerId !== userId) {
      return res.status(403).json({ error: 'Only owner can delete workspace' });
    }

    await prisma.workspace.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

// ===================================
// WORKSPACE MEMBERS
// ===================================

// GET /api/workspaces/:id/members - List members
router.get('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check access
    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: id },
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } }
      },
      orderBy: { joinedAt: 'asc' }
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// POST /api/workspaces/:id/members - Add member (admin/owner only)
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, targetUserId, role = 'member' } = req.body;

    if (!userId || !targetUserId) {
      return res.status(400).json({ error: 'userId and targetUserId are required' });
    }

    // Check if requester is admin/owner
    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } }
    });

    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      return res.status(403).json({ error: 'Only owners and admins can add members' });
    }

    // Add new member
    const member = await prisma.workspaceMember.create({
      data: {
        userId: targetUserId,
        workspaceId: id,
        role
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } }
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// PATCH /api/workspaces/:id/members/:memberId - Update member role
router.patch('/:id/members/:memberId', async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    // Check if requester is admin/owner
    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } }
    });

    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      return res.status(403).json({ error: 'Only owners and admins can update roles' });
    }

    const member = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } }
      }
    });

    res.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/workspaces/:id/members/:memberId - Remove member
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if requester is admin/owner
    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } }
    });

    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      return res.status(403).json({ error: 'Only owners and admins can remove members' });
    }

    await prisma.workspaceMember.delete({ where: { id: memberId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// ===================================
// WORKSPACE INVITATIONS
// ===================================

// POST /api/workspaces/:id/invitations - Create invitation
router.post('/:id/invitations', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, email, role = 'member' } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    // Check if requester is admin/owner
    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } }
    });

    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      return res.status(403).json({ error: 'Only owners and admins can invite members' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    const invitation = await prisma.workspaceInvitation.create({
      data: {
        email,
        workspaceId: id,
        role,
        token,
        invitedBy: userId,
        expiresAt
      },
      include: {
        workspace: { select: { id: true, name: true, slug: true } }
      }
    });

    // Send invitation email
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
    
    await sendInvitationEmail(
      email, 
      invitation.workspace.name, 
      inviter?.name || 'A team member', 
      token
    );

    res.status(201).json(invitation);
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

// GET /api/workspaces/:id/invitations - List invitations
router.get('/:id/invitations', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if requester is admin/owner
    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } }
    });

    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      return res.status(403).json({ error: 'Only owners and admins can view invitations' });
    }

    const invitations = await prisma.workspaceInvitation.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// GET /api/workspaces/invitations/:token - Get invitation details (Public)
router.get('/invitations/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: { 
        workspace: { select: { name: true, logo: true, description: true } },
        // invitedBy user name?
      }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invitation expired' });
    }

    // Return limited info
    res.json({
      email: invitation.email,
      workspaceName: invitation.workspace.name,
      workspaceLogo: invitation.workspace.logo,
      workspaceDescription: invitation.workspace.description,
      invitedBy: invitation.invitedBy // We just store ID currently, maybe useful if frontend fetches user name
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({ error: 'Failed to fetch invitation' });
  }
});

// POST /api/workspaces/invitations/accept - Accept invitation
router.post('/invitations/accept', async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({ error: 'token and userId are required' });
    }

    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: { workspace: true }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invitation expired' });
    }

    // Get user email to verify
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (user.email !== invitation.email) {
      return res.status(403).json({ error: 'Invitation email does not match your account' });
    }

    // Add user to workspace
    const member = await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId: invitation.workspaceId,
        role: invitation.role
      },
      include: {
        workspace: true,
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    // Delete invitation
    await prisma.workspaceInvitation.delete({ where: { id: invitation.id } });

    res.json(member);
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// DELETE /api/workspaces/:id/invitations/:invitationId - Revoke invitation
router.delete('/:id/invitations/:invitationId', async (req, res) => {
  try {
    const { id, invitationId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if requester is admin/owner
    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } }
    });

    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      return res.status(403).json({ error: 'Only owners and admins can revoke invitations' });
    }

    await prisma.workspaceInvitation.delete({ where: { id: invitationId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error revoking invitation:', error);
    res.status(500).json({ error: 'Failed to revoke invitation' });
  }
});

module.exports = router;
