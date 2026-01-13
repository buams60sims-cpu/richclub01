const mongoose = require('mongoose');
require('dotenv').config();

async function resetHeroBanners() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete existing HomeContent to force recreation with new schema
        await mongoose.connection.db.collection('homecontents').deleteMany({});
        console.log('✅ Cleared existing HomeContent documents');
        
        console.log('✅ Hero Banner system reset complete');
        console.log('✅ Server will create 4 banners with alignment system on restart');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetHeroBanners();