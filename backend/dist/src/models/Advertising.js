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
exports.Advertising = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const advertisingSchema = new mongoose_1.Schema({
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
        maxlength: 1000
    },
    advertiserName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    advertiserEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    advertiserPhone: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    category: {
        type: String,
        enum: ['banner', 'sponsored-content', 'directory-listing', 'event-promotion', 'featured-placement'],
        required: true,
        index: true
    },
    targetLocation: [{
            type: String,
            trim: true
        }],
    targetAudience: {
        type: String,
        trim: true,
        maxlength: 500
    },
    startDate: {
        type: Date,
        required: true,
        index: true
    },
    endDate: {
        type: Date,
        required: true,
        index: true
    },
    budget: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'active', 'paused', 'completed', 'rejected'],
        default: 'pending',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    placement: [{
            type: String,
            trim: true
        }],
    images: [{
            type: String,
            trim: true
        }],
    clickCount: {
        type: Number,
        default: 0,
        min: 0
    },
    viewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    conversionCount: {
        type: Number,
        default: 0,
        min: 0
    },
    ctr: {
        type: Number,
        default: 0,
        min: 0
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
        index: true
    },
    paymentId: {
        type: String,
        trim: true
    },
    analytics: {
        impressions: {
            type: Number,
            default: 0,
            min: 0
        },
        clicks: {
            type: Number,
            default: 0,
            min: 0
        },
        conversions: {
            type: Number,
            default: 0,
            min: 0
        },
        spend: {
            type: Number,
            default: 0,
            min: 0
        }
    }
}, {
    timestamps: true
});
advertisingSchema.index({ status: 1, startDate: 1, endDate: 1 });
advertisingSchema.index({ advertiserEmail: 1, createdAt: -1 });
advertisingSchema.index({ category: 1, status: 1 });
advertisingSchema.index({ startDate: 1, endDate: 1, status: 1 });
advertisingSchema.pre('save', function (next) {
    if (this.viewCount > 0) {
        this.ctr = (this.clickCount / this.viewCount) * 100;
    }
    next();
});
advertisingSchema.statics.getActiveAds = async function (placement, category) {
    const now = new Date();
    const query = {
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now }
    };
    if (placement) {
        query.placement = placement;
    }
    if (category) {
        query.category = category;
    }
    return await this.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .select('-analytics -approvedBy -rejectionReason');
};
exports.Advertising = mongoose_1.default.models.Advertising || mongoose_1.default.model('Advertising', advertisingSchema);
//# sourceMappingURL=Advertising.js.map