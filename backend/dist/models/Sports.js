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
exports.Sports = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const sportsSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    address: {
        street: { type: String, default: '' },
        area: { type: String, default: '' },
        city: { type: String, default: 'Kolkata' },
        state: { type: String, default: 'West Bengal' },
        pincode: { type: String, default: '' },
        landmark: { type: String, default: '' }
    },
    contact: {
        phone: [{ type: String }],
        email: { type: String, default: '' },
        website: { type: String, default: '' },
        socialMedia: { type: Object, default: {} }
    },
    category: {
        type: String,
        enum: ['Stadium', 'Sports Grounds', 'Coaching Centers', 'Sports Clubs', 'Sports Facilities'],
        required: true
    },
    sport: { type: String, required: true },
    capacity: { type: Number, default: 100 },
    facilities: [{ type: String }],
    entryFee: {
        adult: { type: Number, default: 0 },
        child: { type: Number, default: 0 },
        senior: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
        isFree: { type: Boolean, default: false }
    },
    timings: {
        monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
        tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
        wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
        thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
        friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
        saturday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
        sunday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } }
    },
    bestTimeToVisit: { type: String, default: 'Morning and evening' },
    duration: { type: String, default: '1-2 hours' },
    amenities: [{ type: String }],
    rating: {
        average: { type: Number, default: 3.5 },
        count: { type: Number, default: 10 }
    },
    tags: [{ type: String }],
    status: { type: String, default: 'active' },
    featured: { type: Boolean, default: false },
    promoted: { type: Boolean, default: false },
    osmId: { type: Number, sparse: true },
    source: { type: String, default: 'OpenStreetMap' },
    images: [{ type: String }]
}, {
    timestamps: true
});
sportsSchema.index({ location: '2dsphere' });
sportsSchema.index({ category: 1, sport: 1 });
sportsSchema.index({ status: 1, featured: 1 });
exports.Sports = mongoose_1.default.models.Sports || mongoose_1.default.model('Sports', sportsSchema);
//# sourceMappingURL=Sports.js.map