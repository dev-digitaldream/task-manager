const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }

    const workspace = await prisma.workspace.findFirst({ where: { ownerId: user.id } });
    if (!workspace) {
      console.log('No workspace found for user');
      return;
    }

    console.log('Creating task for workspace:', workspace.name, 'and user:', user.name);

    const task = await prisma.task.create({
      data: {
        title: 'Test Verification Task ' + Date.now(),
        workspaceId: workspace.id,
        assigneeId: user.id,
        ownerId: user.id,
        status: 'todo'
      }
    });

    console.log('Task created:', task.id);
    console.log('Task Workspace ID:', task.workspaceId);

    if (task.workspaceId === workspace.id) {
      console.log('SUCCESS: Task correctly linked to workspace');
    } else {
      console.error('FAILURE: Task lost workspace link');
    }

    await prisma.task.delete({ where: { id: task.id } });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
