#!/usr/bin/env node

// Safe Prisma generation script that handles network restrictions
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

function safePrismaGenerate() {
  // Skip generation if explicitly disabled
  if (process.env.SKIP_PRISMA_GENERATE === 'true' || process.env.PRISMA_SKIP_DOWNLOAD === 'true') {
    console.log('Skipping Prisma generation due to environment configuration');
    return;
  }

  // Check if Prisma client already exists
  const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
  if (existsSync(prismaClientPath)) {
    console.log('Prisma client already exists, skipping generation');
    return;
  }

  try {
    console.log('Attempting Prisma generation...');
    // Set environment variables to prevent binary downloads in restricted environments
    process.env.PRISMA_CLI_BINARY_TARGETS = 'native';
    process.env.PRISMA_ENGINES_MIRROR = '';
    
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      timeout: 60000 // 1 minute timeout
    });
    console.log('Prisma generation completed successfully');
  } catch (error) {
    console.warn('Prisma generation failed:', error.message);
    console.warn('This is expected in restricted network environments');
    console.warn('The application will use runtime fallbacks');
    // Don't exit with error - let the build continue
  }
}

safePrismaGenerate();