const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    // Basic Information
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    
    // Branding Information
    brandName: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    logoImage: {
        type: String,
        default: '/assetsLanding/img/logoMomke.png'
    },
    coverImage: {
        type: String,
        default: '/assetsLanding/img/in-front.jpg'
    },
    
    // Customization
    // Primary and secondary colors removed as requested
    
    // Social Media
    facebook: {
        type: String,
        default: ''
    },
    // Only Facebook is used now, other social media removed
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    
    // Analytics
    studentCount: {
        type: Number,
        default: 0
    },
    courseCount: {
        type: Number,
        default: 0
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Pre-save hook to ensure slug is created from name if not provided
teacherSchema.pre('save', function(next) {
    if (!this.slug) {
        // Create a URL-friendly slug from the name
        // Handle Arabic characters by transliterating common Arabic characters to English
        let arabicToEnglishMap = {
            'أ': 'a', 'إ': 'e', 'آ': 'a', 'ا': 'a',
            'ب': 'b', 'ت': 't', 'ث': 'th',
            'ج': 'j', 'ح': 'h', 'خ': 'kh',
            'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z',
            'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
            'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
            'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
            'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
            'ي': 'y', 'ى': 'a', 'ئ': 'e', 'ء': 'a',
            'ؤ': 'o', 'ة': 'h'
        };
        
        let nameInEnglish = '';
        const name = this.name;
        
        // Convert Arabic characters to English equivalents
        for (let i = 0; i < name.length; i++) {
            if (arabicToEnglishMap[name[i]]) {
                nameInEnglish += arabicToEnglishMap[name[i]];
            } else {
                nameInEnglish += name[i];
            }
        }
        
        // Create the slug
        this.slug = nameInEnglish.toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
            
        // If slug is empty after processing, use a default with timestamp
        if (!this.slug) {
            this.slug = 'teacher-' + Date.now().toString().slice(-6);
        }
    }
    next();
});

// Method to get landing page data
teacherSchema.methods.getLandingPageData = function() {
    console.log(this.coverImage);
    return {
        name: this.name,
        brandName: this.brandName || this.name, // Use name as fallback for brandName
        description: this.description,
        logoImage: this.logoImage,
        coverImage: this.coverImage,
        social: {
            facebook: this.facebook || ''
        }
    };
};

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
