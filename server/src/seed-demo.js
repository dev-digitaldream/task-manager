/**
 * Demo Seed - Populate database with demo data
 * 
 * Creates demo users with credentials and sample tasks
 * 
 * Copyright (c) 2025 Digital Dream (www.digitaldream.work)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users with credentials
  const demoPassword = await bcrypt.hash('Demo2024!', 10);
  const adminPassword = await bcrypt.hash('Admin2024!', 10);

  const demo = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@digitaldream.work',
      password: demoPassword,
      avatar: '👤',
      isAdmin: false
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@digitaldream.work',
      password: adminPassword,
      avatar: '👨‍💼',
      isAdmin: true
    }
  });

  const alice = await prisma.user.create({
    data: {
      name: 'Alice',
      avatar: '👩‍💻',
      isAdmin: false
    }
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob',
      avatar: '👨‍🎨',
      isAdmin: false
    }
  });

  console.log('✅ Created 4 users');
  console.log('');
  console.log('📧 Demo Credentials:');
  console.log('   Email: demo@digitaldream.work');
  console.log('   Password: Demo2024!');
  console.log('');
  console.log('👑 Admin Credentials:');
  console.log('   Email: admin@digitaldream.work');
  console.log('   Password: Admin2024!');
  console.log('');

  // Create sample tasks
  const tasks = [
    {
      title: 'Setup project repository',
      status: 'done',
      priority: 'high',
      assigneeId: admin.id,
      ownerId: admin.id,
      isPublic: true,
      publicSummary: 'Project setup completed',
      clientApproval: 'approved'
    },
    {
      title: 'Design landing page mockup',
      status: 'done',
      priority: 'medium',
      assigneeId: bob.id,
      ownerId: admin.id,
      isPublic: true,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      title: 'Implement user authentication',
      status: 'doing',
      priority: 'urgent',
      assigneeId: alice.id,
      ownerId: admin.id,
      isPublic: true,
      publicSummary: 'Auth system in progress',
      clientApproval: 'pending',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // in 2 days
    },
    {
      title: 'Write API documentation',
      status: 'doing',
      priority: 'medium',
      assigneeId: demo.id,
      ownerId: admin.id,
      isPublic: true,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // in 5 days
    },
    {
      title: 'Setup CI/CD pipeline',
      status: 'todo',
      priority: 'high',
      assigneeId: alice.id,
      ownerId: admin.id,
      isPublic: true,
      clientApproval: 'none'
    },
    {
      title: 'Create mobile app mockups',
      status: 'todo',
      priority: 'low',
      assigneeId: bob.id,
      ownerId: demo.id,
      isPublic: false
    },
    {
      title: 'Optimize database queries',
      status: 'todo',
      priority: 'medium',
      assigneeId: alice.id,
      ownerId: admin.id,
      isPublic: true,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // in 7 days
    },
    {
      title: 'Prepare product launch',
      status: 'todo',
      priority: 'urgent',
      assigneeId: admin.id,
      ownerId: admin.id,
      isPublic: true,
      publicSummary: 'Launch preparation',
      clientApproval: 'pending',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // in 10 days
    },
    {
      title: 'Fix responsive design issues',
      status: 'doing',
      priority: 'high',
      assigneeId: bob.id,
      ownerId: demo.id,
      isPublic: true,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // tomorrow
    },
    {
      title: 'Update user guide',
      status: 'todo',
      priority: 'low',
      assigneeId: demo.id,
      ownerId: admin.id,
      isPublic: false
    }
  ];

  for (const taskData of tasks) {
    await prisma.task.create({ data: taskData });
  }

  console.log('✅ Created 10 sample tasks');

  // Add some comments
  const allTasks = await prisma.task.findMany();
  
  await prisma.comment.create({
    data: {
      content: 'Great work on this! The design looks amazing.',
      taskId: allTasks[1].id,
      authorId: admin.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'I\'ve implemented OAuth support. Testing in progress.',
      taskId: allTasks[2].id,
      authorId: alice.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Should we use GitHub Actions or GitLab CI?',
      taskId: allTasks[4].id,
      authorId: alice.id
    }
  });

  console.log('✅ Added sample comments');
  console.log('');
  console.log('🎉 Demo database ready!');
  console.log('');
  console.log('📊 Summary:');
  console.log('   - 4 users (2 with email/password, 2 simple)');
  console.log('   - 10 tasks (various statuses and priorities)');
  console.log('   - 3 comments');
  console.log('   - 7 public tasks (visible on dashboard)');
  console.log('');
  console.log('🌐 Access the demo:');
  console.log('   - Login with: demo@digitaldream.work / Demo2024!');
  console.log('   - Or admin: admin@digitaldream.work / Admin2024!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
