/**
 * Task Manager - Database Seed (Empty)
 * 
 * Creates a clean database with no pre-populated data.
 * Run this before pushing to Git to ensure clean state.
 * 
 * Copyright (c) 2025 Digital Dream (www.digitaldream.work)
 * Licensed under MIT License
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database...');

  // Delete all existing data (in correct order due to foreign keys)
  await prisma.auditLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleaned successfully!');
  console.log('📝 Database is now empty and ready for first users.');
  console.log('');
  console.log('👉 First user will be created when someone logs in.');
}

main()
  .catch((e) => {
    console.error('❌ Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
