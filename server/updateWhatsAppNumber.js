const mongoose = require('mongoose');
const HomeContent = require('./models/HomeContent');

const MONGO_URI = 'mongodb://localhost:27017/richclub';
const NEW_WHATSAPP_NUMBER = '916362145668';

async function updateWhatsAppNumber() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const result = await HomeContent.findOneAndUpdate(
            { isActive: true },
            { 
                $set: { 
                    'customDesignSection.whatsappNumber': NEW_WHATSAPP_NUMBER 
                } 
            },
            { new: true }
        );

        if (result) {
            console.log('✅ WhatsApp number updated successfully!');
            console.log(`   Custom Design WhatsApp: +${result.customDesignSection.whatsappNumber}`);
        } else {
            console.log('❌ No active home content found');
        }

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateWhatsAppNumber();
