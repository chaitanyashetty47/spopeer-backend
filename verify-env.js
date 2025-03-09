require('dotenv').config();

console.log('\n=== Environment Verification ===\n');

// Check Node version
console.log('Node Version:', process.version);
console.log('NODE_OPTIONS:', process.env.NODE_OPTIONS || 'not set');

// Check required environment variables
const requiredEnvVars = [
  'GOOGLE_SHEETS_CLIENT_EMAIL',
  'GOOGLE_SHEETS_PRIVATE_KEY',
  'GOOGLE_SHEETS_SPREADSHEET_ID'
];

let hasErrors = false;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`\nChecking ${varName}:`);
  if (!value) {
    console.log('❌ Missing');
    hasErrors = true;
  } else {
    console.log('✓ Present');
    if (varName === 'GOOGLE_SHEETS_PRIVATE_KEY') {
      // Check private key format
      const keyLength = value.length;
      console.log('Key length:', keyLength);
      console.log('Contains BEGIN marker:', value.includes('-----BEGIN PRIVATE KEY-----'));
      console.log('Contains END marker:', value.includes('-----END PRIVATE KEY-----'));
      console.log('Contains \\n:', value.includes('\\n'));
    }
  }
});

if (hasErrors) {
  console.log('\n❌ Some environment variables are missing!');
  process.exit(1);
} else {
  console.log('\n✓ All required environment variables are present');
} 