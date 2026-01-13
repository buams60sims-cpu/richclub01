const mongoose = require('mongoose');
require('dotenv').config();

async function resetHomeContent() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete existing HomeContent documents
        await mongoose.connection.db.collection('homecontents').deleteMany({});
        console.log('Deleted existing HomeContent documents');

        console.log('HomeContent reset complete. Server will create new default content on next request.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetHomeContent();