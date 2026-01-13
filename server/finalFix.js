const mongoose = require('mongoose');
require('dotenv').config();

async function finalFix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete existing problematic documents
        await mongoose.connection.db.collection('homecontents').deleteMany({});
        console.log('Cleared existing HomeContent documents');

        console.log('✅ Database reset complete');
        console.log('✅ Server will create new content with proper validation on restart');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

finalFix();