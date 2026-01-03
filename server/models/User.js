const mongoose = require('mongoose');

/**
 * User Model
 * Defines the schema for user authentication and profile
 * Supports both regular users and admin users
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email'
            ]
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Don't include password in queries by default
        },
        role: {
            type: String,
            enum: {
                values: ['USER', 'ADMIN'],
                message: '{VALUE} is not a valid role'
            },
            default: 'USER',
            uppercase: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);

