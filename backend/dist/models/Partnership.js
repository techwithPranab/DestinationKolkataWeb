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
exports.Partnership = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const partnershipSchema = new mongoose_1.Schema({
    partnerName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    partnerType: {
        type: String,
        enum: ['hotel', 'restaurant', 'travel-agency', 'attraction', 'event-organizer', 'transport', 'technology', 'media', 'government', 'other'],
        required: true,
        index: true
    },
    contactPerson: {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        designation: {
            type: String,
            trim: true,
            maxlength: 100
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[+]?[1-9]\d{0,15}$/, 'Please enter a valid phone number']
        }
    },
    companyDetails: {
        website: {
            type: String,
            trim: true
        },
        address: {
            street: String,
            city: {
                type: String,
                required: true,
                trim: true
            },
            state: {
                type: String,
                required: true,
                trim: true
            },
            pincode: {
                type: String,
                required: true,
                trim: true
            },
            country: {
                type: String,
                required: true,
                trim: true,
                default: 'India'
            }
        },
        established: Date,
        employeeCount: {
            type: String,
            enum: ['1-10', '11-50', '51-200', '201-500', '500+']
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        }
    },
    partnershipType: {
        type: String,
        enum: ['listing', 'promotional', 'strategic', 'affiliate', 'content', 'technology', 'event'],
        required: true,
        index: true
    },
    proposedBenefits: [{
            type: String,
            trim: true,
            maxlength: 200
        }],
    offerDetails: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    expectedOutcome: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    duration: {
        startDate: Date,
        endDate: Date,
        renewable: {
            type: Boolean,
            default: true
        }
    },
    financialTerms: {
        commissionRate: {
            type: Number,
            min: 0,
            max: 100
        },
        flatFee: {
            type: Number,
            min: 0
        },
        revenueShare: {
            type: Number,
            min: 0,
            max: 100
        },
        paymentTerms: String
    },
    status: {
        type: String,
        enum: ['inquiry', 'under-review', 'negotiation', 'approved', 'active', 'paused', 'terminated', 'rejected'],
        default: 'inquiry',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    internalNotes: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    documents: [{
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
            uploadedAt: {
                type: Date,
                default: Date.now
            },
            type: {
                type: String,
                enum: ['contract', 'proposal', 'certificate', 'other'],
                default: 'other'
            }
        }],
    communicationLog: [{
            date: {
                type: Date,
                required: true,
                default: Date.now
            },
            type: {
                type: String,
                enum: ['email', 'call', 'meeting', 'other'],
                required: true
            },
            summary: {
                type: String,
                required: true,
                trim: true,
                maxlength: 1000
            },
            nextAction: {
                type: String,
                trim: true,
                maxlength: 200
            },
            nextActionDate: Date,
            createdBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        }],
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
    tags: [{
            type: String,
            trim: true,
            lowercase: true
        }]
}, {
    timestamps: true
});
partnershipSchema.index({ status: 1, partnerType: 1 });
partnershipSchema.index({ priority: 1, status: 1 });
partnershipSchema.index({ assignedTo: 1, status: 1 });
partnershipSchema.index({ 'contactPerson.email': 1 });
partnershipSchema.index({ partnerName: 'text', 'companyDetails.description': 'text' });
partnershipSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'approved' && !this.approvedAt) {
        this.approvedAt = new Date();
    }
    next();
});
partnershipSchema.statics.getByStatus = async function (status) {
    return await this.find({ status })
        .populate('assignedTo', 'firstName lastName name email')
        .populate('approvedBy', 'firstName lastName name')
        .sort({ createdAt: -1 });
};
exports.Partnership = mongoose_1.default.models.Partnership || mongoose_1.default.model('Partnership', partnershipSchema);
//# sourceMappingURL=Partnership.js.map