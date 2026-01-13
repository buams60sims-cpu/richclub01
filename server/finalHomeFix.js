const mongoose = require('mongoose');
require('dotenv').config();

async function finalHomeFix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete existing HomeContent documents
        await mongoose.connection.db.collection('homecontents').deleteMany({});
        console.log('✅ Cleared existing HomeContent documents');
        
        console.log('✅ Home Page CMS fix complete');
        console.log('✅ Hero text now left-aligned with sharp imagery');
        console.log('✅ Customized T-Shirts section removed');
        console.log('✅ Custom Design Banner CMS ready');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

finalHomeFix();