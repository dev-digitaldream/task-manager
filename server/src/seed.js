const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const defaultUsers = [
  { name: 'Mohammed', avatar: '👨‍💻', password: 'Mohammed1$' },
  { name: 'Hicham', avatar: '👨‍💼', password: 'Hicham1$' },
  { name: 'Sophie', avatar: '👩‍💻', password: 'Sophie1$' },
  { name: 'Rik', avatar: '👨‍🎨', password: 'Rik1$' }
];

const defaultTasks = [
  {
    title: 'Configuration de l\'espace de travail collaboratif',
    status: 'done',
    assigneeIndex: 0, // Mohammed
    priority: 'medium',
    clientApproval: 'approved',
    approvalComment: 'Validé par le client après démo.'
  },
  {
    title: 'Interface utilisateur responsive',
    status: 'doing',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
    assigneeIndex: 1, // Hicham
    priority: 'high',
    clientApproval: 'pending',
    approvalComment: 'En attente du retour du client.'
  },
  {
    title: 'Système d\'authentification',
    status: 'todo',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
    assigneeIndex: 2, // Sophie
    priority: 'urgent',
    clientApproval: 'none'
  },
  {
    title: 'Tests d\'intégration',
    status: 'todo',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // -1 day (overdue)
    assigneeIndex: 3, // Rik
    priority: 'medium',
    clientApproval: 'rejected',
    approvalComment: 'Besoin de corrections sur les scénarios 2 et 3.'
  },
  {
    title: 'Documentation technique',
    status: 'todo',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
    assigneeIndex: 0, // Mohammed
    priority: 'low',
    clientApproval: 'none'
  }
];

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = [];
  for (const userData of defaultUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        avatar: userData.avatar,
        password: hashedPassword
      }
    });
    users.push(user);
  }

  // Create tasks
  for (const taskData of defaultTasks) {
    const { assigneeIndex, ...taskInfo } = taskData;
    await prisma.task.create({
      data: {
        ...taskInfo,
        assigneeId: users[assigneeIndex]?.id || null
      }
    });
  }

  console.log('Database seeded successfully!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });