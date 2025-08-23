// Test script to verify Cloudinary setup
const cloudinary = require('cloudinary').v2;

// Test Cloudinary configuration
console.log('Testing Cloudinary configuration...');

// Check if environment variables are set
const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars);
    console.error('Please set these in your .env file');
    process.exit(1);
}

console.log('✅ Environment variables are set');

// Test Cloudinary configuration
try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Cloudinary configuration successful');
} catch (error) {
    console.error('❌ Cloudinary configuration failed:', error.message);
    process.exit(1);
}

// Test API connection (optional - requires internet)
console.log('\nTesting Cloudinary API connection...');
cloudinary.api.ping()
    .then(result => {
        console.log('✅ Cloudinary API connection successful');
        console.log('Response:', result);
    })
    .catch(error => {
        console.error('❌ Cloudinary API connection failed:', error.message);
        console.log('This might be due to network issues or invalid credentials');
    });

console.log('\nSetup verification complete!');
console.log('\nNext steps:');
console.log('1. Start your backend server: npm start');
console.log('2. Start your frontend: npm run dev');
console.log('3. Test registration with a profile picture');
console.log('4. Check your Cloudinary dashboard for uploaded images');
