// Production startup script that handles all deployment requirements
import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 Starting Parmanand Sports Academy in production mode...');

// Create necessary directories
const requiredDirs = [
  'dist/public',
  'dist/public/assets',
  'server/logs'
];

requiredDirs.forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Build the application
console.log('📦 Building application...');
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully');
    startProduction();
  } else {
    console.log('❌ Build failed, attempting to start with existing build...');
    startProduction();
  }
});

function startProduction() {
  // Check if the built server exists
  if (!existsSync('dist/index.js')) {
    console.error('❌ No built server found. Running emergency build...');
    const emergencyBuild = spawn('npx', [
      'esbuild', 
      'server/index.ts', 
      '--platform=node', 
      '--packages=external', 
      '--bundle', 
      '--format=esm', 
      '--outdir=dist'
    ], {
      stdio: 'inherit',
      shell: true
    });
    
    emergencyBuild.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Emergency build completed');
        launchServer();
      } else {
        console.error('❌ Emergency build failed');
        process.exit(1);
      }
    });
  } else {
    launchServer();
  }
}

function launchServer() {
  console.log('🚀 Starting production server...');
  
  // Set up database if needed
  if (process.env.DATABASE_URL) {
    console.log('🗄️ Database URL configured');
    const dbPush = spawn('npm', ['run', 'db:push'], {
      stdio: 'inherit',
      shell: true
    });
    
    dbPush.on('close', () => {
      console.log('📊 Database setup completed');
      startServer();
    });
  } else {
    console.log('⚠️ No database URL configured, skipping database setup');
    startServer();
  }
}

function startServer() {
  console.log(`🌐 Starting server on port ${process.env.PORT}...`);
  
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });
  
  serverProcess.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
  
  serverProcess.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    serverProcess.kill('SIGTERM');
  });
  
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    serverProcess.kill('SIGINT');
  });
}