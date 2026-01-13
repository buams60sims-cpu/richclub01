const mongoose = require('mongoose');
require('dotenv').config();

async function resetCMS() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete existing HomeContent documents
        await mongoose.connection.db.collection('homecontents').deleteMany({});
        console.log('✅ Cleared existing HomeContent documents');
        
        console.log('✅ CMS reset complete - production-grade schema ready');
        console.log('✅ Sections are now independent and optional');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetCMS();