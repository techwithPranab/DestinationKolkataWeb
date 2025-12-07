"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessResource = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const businessResourceSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    category: {
        type: String,
        enum: ['guides', 'templates', 'tools', 'webinars', 'case-studies', 'market-insights', 'legal', 'financial'],
        required: true,
        index: true
    },
    subcategory: {
        type: String,
        trim: true,
        maxlength: 100
    },
    content: {
        type: String,
        required: true
    },
    fileAttachments: [{
            filename: {
                type: String,
                required: true,
                trim: true
            },
            url: {
                type: String,
                required: true,
                trim: true
            },
            fileType: {
                type: String,
                required: true,
                trim: true
            },
            size: {
                type: Number,
                required: true,
                min: 0
            }
        }],
    tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
    targetAudience: {
        type: String,
        enum: ['restaurants', 'hotels', 'travel-agencies', 'event-organizers', 'attractions', 'all'],
        required: true,
        index: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true,
        index: true
    },
    estimatedReadTime: {
        type: Number,
        required: true,
        min: 1
    },
    downloadCount: {
        type: Number,
        default: 0,
        min: 0
    },
    viewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    likes: {
        type: Number,
        default: 0,
        min: 0
    },
    likedBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    featured: {
        type: Boolean,
        default: false,
        index: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        index: true
    },
    publishedAt: Date,
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    seoMeta: {
        metaTitle: {
            type: String,
            maxlength: 60
        },
        metaDescription: {
            type: String,
            maxlength: 160
        },
        keywords: [{
                type: String,
                trim: true
            }],
        canonicalUrl: {
            type: String,
            trim: true
        }
    },
    relatedResources: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'BusinessResource'
        }],
    comments: [{
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            comment: {
                type: String,
                required: true,
                trim: true,
                maxlength: 1000
            },
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            replies: [{
                    user: {
                        type: mongoose_1.Schema.Types.ObjectId,
                        ref: 'User',
                        required: true
                    },
                    reply: {
                        type: String,
                        required: true,
                        trim: true,
                        maxlength: 500
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }]
        }]
}, {
    timestamps: true
});
businessResourceSchema.index({ status: 1, category: 1, targetAudience: 1 });
businessResourceSchema.index({ featured: 1, status: 1, publishedAt: -1 });
businessResourceSchema.index({ tags: 1, status: 1 });
businessResourceSchema.index({ author: 1, status: 1 });
businessResourceSchema.index({
    title: 'text',
    description: 'text',
    content: 'text',
    tags: 'text'
});
businessResourceSchema.virtual('slug').get(function () {
    return this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
});
businessResourceSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});
businessResourceSchema.statics.getFeaturedResources = async function (limit = 5) {
    return await this.find({
        status: 'published',
        featured: true
    })
        .populate('author', 'firstName lastName name')
        .sort({ publishedAt: -1 })
        .limit(limit)
        .select('-content -comments');
};
businessResourceSchema.statics.getPopularResources = async function (limit = 5) {
    return await this.find({
        status: 'published'
    })
        .populate('author', 'firstName lastName name')
        .sort({
        viewCount: -1,
        downloadCount: -1,
        likes: -1
    })
        .limit(limit)
        .select('-content -comments');
};
exports.BusinessResource = mongoose_1.default.models.BusinessResource || mongoose_1.default.model('BusinessResource', businessResourceSchema);
//# sourceMappingURL=BusinessResource.js.map