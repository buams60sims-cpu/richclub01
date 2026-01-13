const mongoose = require('mongoose');
require('dotenv').config();

async function fixHomeContent() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update existing HomeContent document to add missing image field
        const result = await mongoose.connection.db.collection('homecontents').updateMany(
            { 'customizedTShirtSection.image': { $exists: false } },
            { 
                $set: { 
                    'customizedTShirtSection.image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop'
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} documents`);

        // Also ensure customDesignSection exists
        await mongoose.connection.db.collection('homecontents').updateMany(
            { 'customDesignSection': { $exists: false } },
            { 
                $set: { 
                    'customDesignSection': {
                        isActive: true,
                        badge: "CUSTOM COLLECTION",
                        headline: "Design Your Own",
                        description: "Create your unique style with premium fabrics and unlimited customization possibilities.",
                        ctaText: "START DESIGNING",
                        ctaLink: "/custom-design",
                        images: [
                            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=2070&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=2127&auto=format&fit=crop"
                        ]
                    }
                }
            }
        );

        console.log('HomeContent documents updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixHomeContent();