#!/usr/bin/env node

// Start backend server and frontend, then launch Electron
const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Starting Task Manager Desktop...\n')

// Start backend
const server = spawn('npm', ['run', 'server'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
})

// Start frontend
const client = spawn('npm', ['run', 'client'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
})

// Wait 3 seconds then launch Electron
setTimeout(() => {
  console.log('\n⚡ Launching Electron...\n')
  const electron = spawn('npx', ['electron', '.'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  })

  electron.on('exit', () => {
    console.log('\n👋 Shutting down...')
    server.kill()
    client.kill()
    process.exit(0)
  })
}, 3000)

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...')
  server.kill()
  client.kill()
  process.exit(0)
})
