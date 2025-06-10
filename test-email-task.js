// Test script for email tasks
// Run this with: node test-email-task.js

const { sendScheduledEmails } = require('./src/worker/tasks/email-tasks.ts');

// Mock helpers object for testing
const mockHelpers = {
  logger: {
    info: (msg) => console.log(`[INFO] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
    debug: (msg) => console.log(`[DEBUG] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`)
  }
};

async function testEmailTask() {
  console.log('Testing email task...');
  
  try {
    await sendScheduledEmails({}, mockHelpers);
    console.log('Email task test completed successfully!');
  } catch (error) {
    console.error('Email task test failed:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testEmailTask();
}
