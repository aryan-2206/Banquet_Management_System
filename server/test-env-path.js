const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
