const fs = require('fs');
const path = require('path');

console.log('Setting up environment configuration...\n');

const envContent = `# Google OAuth Configuration
GOOGLE_CLIENT_ID=314061526138-r8gk1vfcan1rm93p0otk93cvtmdcohev.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# JWT Configuration
JWT_SECRET=bharatsetu-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_PATH=./bharatsetu.db

# Security
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('\n📝 Environment Configuration:');
    console.log('✅ Google Client ID: Configured');
    console.log('⚠️  Google Client Secret: Please add your actual secret');
    console.log('✅ JWT Secret: Generated');
    console.log('✅ Server Port: 3000');
    console.log('✅ Database Path: ./bharatsetu.db');
    console.log('\n🚀 Ready to start the server!');
    console.log('Run: npm run dev');
} catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    console.log('\n📋 Manual Setup:');
    console.log('1. Create a file named .env in the project root');
    console.log('2. Copy the content from env.example');
    console.log('3. Replace GOOGLE_CLIENT_ID with: 314061526138-r8gk1vfcan1rm93p0otk93cvtmdcohev.apps.googleusercontent.com');
} 