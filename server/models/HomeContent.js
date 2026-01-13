const mongoose = require('mongoose');

/**
 * Home Content Model
 * Manages all editable content on the Home page
 * Supports Hero, Lookbook, Featured Products sections
 */

const heroSlideSchema = new mongoose.Schema({
    badge: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Badge text cannot exceed 100 characters']
    },
    headline: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Headline cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        type: String,
        required: true,
        validate: {
            validator: function (url) {
                return /^https?:\/\/.+/.test(url) || url.startsWith('/');
            },
            message: 'Please provide a valid image URL'
        }
    },
    ctaText: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'CTA text cannot exceed 50 characters']
    },
    ctaLink: {
        type: String,
        required: true,
        trim: true
    },
    alignment: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: function() {
            // Fixed alignment pattern: center, left, right, center
            const alignments = ['center', 'left', 'right', 'center'];
            return alignments[this.order] || 'center';
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0,
        min: 0,
        max: 3
    }
});

const lookbookItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [300, 'Description cannot exceed 300 characters']
    },
    image: {
        type: String,
        required: true,
        validate: {
            validator: function (url) {
                return /^https?:\/\/.+/.test(url) || url.startsWith('/');
            },
            message: 'Please provide a valid image URL'
        }
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
});

const homeContentSchema = new mongoose.Schema(
    {
        // Hero Section
        heroSlides: {
            type: [heroSlideSchema],
            validate: {
                validator: function (slides) {
                    return slides.length === 4;
                },
                message: 'Exactly 4 hero slides are required'
            }
        },

        // Lookbook Section
        lookbookItems: {
            type: [lookbookItemSchema],
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: 'At least one lookbook item is required'
            }
        },

        // Featured Products Section (Editor's Picks)
        featuredSection: {
            isActive: {
                type: Boolean,
                default: true
            },
            badge: {
                type: String,
                default: 'Curated Discovery',
                trim: true
            },
            title: {
                type: String,
                default: "Editor's Picks",
                trim: true
            },
            // Product IDs will be selected from existing products
            productIds: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }],
            maxProducts: {
                type: Number,
                default: 10,
                min: 1,
                max: 20
            }
        },

        // Custom Design Banner Section (replaces New Arrivals)
        customDesignSection: {
            isActive: {
                type: Boolean,
                default: true
            },
            badge: {
                type: String,
                default: 'Custom Collection',
                trim: true,
                maxlength: [50, 'Badge cannot exceed 50 characters']
            },
            title: {
                type: String,
                default: 'Design Your Own',
                trim: true,
                maxlength: [100, 'Title cannot exceed 100 characters']
            },
            description: {
                type: String,
                default: 'Create unique, personalized t-shirts using premium fabrics and custom prints tailored to your style.',
                trim: true,
                maxlength: [300, 'Description cannot exceed 300 characters']
            },
            ctaText: {
                type: String,
                default: 'Start Designing',
                trim: true,
                maxlength: [30, 'CTA text cannot exceed 30 characters']
            },
            whatsappNumber: {
                type: String,
                default: '919876543210',
                trim: true,
                validate: {
                    validator: function (number) {
                        return /^\d{10,15}$/.test(number);
                    },
                    message: 'Please provide a valid WhatsApp number (10-15 digits)'
                }
            },
            images: [{
                type: String,
                validate: {
                    validator: function (url) {
                        return !url || /^https?:\/\/.+/.test(url) || url.startsWith('/');
                    },
                    message: 'Please provide a valid image URL'
                }
            }]
        },

        // USP Section (Trust Badges)
        uspSection: {
            isActive: {
                type: Boolean,
                default: true
            }
        },

        // Global settings
        isActive: {
            type: Boolean,
            default: true
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Ensure only one home content document exists
homeContentSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

// Method to get active hero slides sorted by order
homeContentSchema.methods.getActiveHeroSlides = function () {
    return this.heroSlides
        .filter(slide => slide.isActive)
        .sort((a, b) => a.order - b.order);
};

// Method to get active lookbook items sorted by order
homeContentSchema.methods.getActiveLookbookItems = function () {
    return this.lookbookItems
        .filter(item => item.isActive)
        .sort((a, b) => a.order - b.order);
};

// Static method to get or create home content
homeContentSchema.statics.getOrCreate = async function () {
    let content = await this.findOne({ isActive: true });

    if (!content) {
        // Create default content with existing hardcoded values
        content = await this.create({
            heroSlides: [
                {
                    badge: "A NEW ERA OF STYLE",
                    headline: "Luxury Fashion for the Modern Individual",
                    description: "Curated collections that blend timeless elegance with contemporary design. Elevate your wardrobe with Rich Club.",
                    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
                    ctaText: "Explore Collection",
                    ctaLink: "/shop",
                    alignment: "center",
                    order: 0
                },
                {
                    badge: "CRAFTED WITH PURPOSE",
                    headline: "Timeless Design. Premium Craftsmanship.",
                    description: "Discover pieces designed to last a lifetime. Our focus on quality ensures you always look your best.",
                    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop",
                    ctaText: "Our Story",
                    ctaLink: "/about",
                    alignment: "left",
                    order: 1
                },
                {
                    badge: "NEW ARRIVALS",
                    headline: "New Season. Elevated Style.",
                    description: "Fresh drops that define the cutting edge of fashion. Stay ahead of the curve with our latest curated pieces.",
                    image: "https://images.unsplash.com/photo-1445205170230-053b830c6046?q=80&w=2070&auto=format&fit=crop",
                    ctaText: "Shop New",
                    ctaLink: "/shop",
                    alignment: "right",
                    order: 2
                },
                {
                    badge: "EXCLUSIVE COLLECTION",
                    headline: "Signature Pieces. Unmatched Quality.",
                    description: "Experience the pinnacle of luxury fashion with our exclusive signature collection crafted for discerning individuals.",
                    image: "https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?q=80&w=2070&auto=format&fit=crop",
                    ctaText: "Discover More",
                    ctaLink: "/shop",
                    alignment: "center",
                    order: 3
                }
            ],
            lookbookItems: [
                {
                    title: "Autumn Essentials",
                    description: "Warm tones and timeless silhouettes for the changing season.",
                    image: "https://images.unsplash.com/photo-1539109132314-34a933d1e2f3?q=80&w=1974&auto=format&fit=crop",
                    link: "/shop",
                    order: 0
                },
                {
                    title: "Modern Classics",
                    description: "The foundation of a refined and versatile wardrobe.",
                    image: "https://images.unsplash.com/photo-1594932224036-9c20533220bb?q=80&w=2080&auto=format&fit=crop",
                    link: "/shop",
                    order: 1
                },
                {
                    title: "Minimal Street",
                    description: "Where contemporary comfort meets architectural design.",
                    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1974&auto=format&fit=crop",
                    link: "/shop",
                    order: 2
                },
                {
                    title: "Accessories Edit",
                    description: "The finishing touches of distinction for the modern individual.",
                    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1974&auto=format&fit=crop",
                    link: "/shop",
                    order: 3
                }
            ],
            featuredSection: {
                isActive: true,
                badge: "Curated Discovery",
                title: "Editor's Picks",
                productIds: [],
                maxProducts: 10
            },
            customDesignSection: {
                isActive: true,
                badge: "Custom Collection",
                title: "Design Your Own",
                description: "Create unique, personalized t-shirts using premium fabrics and custom prints tailored to your style.",
                ctaText: "Start Designing",
                whatsappNumber: "919876543210",
                images: [
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=2070&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=2127&auto=format&fit=crop"
                ]
            },
            uspSection: {
                isActive: true
            }
        });
    }

    return content;
};

module.exports = mongoose.model('HomeContent', homeContentSchema);
