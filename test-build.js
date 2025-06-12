// Quick test to verify the build process works correctly
console.log("Testing build process...");

// Test the full build
const { exec } = require('child_process');

exec('npm run build:worker', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Build failed:', error);
    return;
  }
  
  console.log('✅ Build successful!');
  console.log('Build output:', stdout);
  
  // Test that the compiled worker can be loaded
  try {
    const workerPath = './dist/worker/index.js';
    require(workerPath);
    console.log('❌ Worker should not run without DATABASE_URL');
  } catch (error) {
    if (error.message.includes('DATABASE_URL environment variable is not set')) {
      console.log('✅ Worker module loads correctly and fails properly without DATABASE_URL');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
});
