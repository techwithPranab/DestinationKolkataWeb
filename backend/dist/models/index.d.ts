import mongoose, { Document } from 'mongoose';
export interface IHotel extends Document {
    name: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    priceRange: {
        min: number;
        max: number;
        currency: string;
    };
    roomTypes: Array<{
        name: string;
        price: number;
        capacity: number;
        amenities: string[];
        images: string[];
        available: boolean;
    }>;
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    policies: string[];
    category: string;
}
export interface IRestaurant extends Document {
    name: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    cuisine: string[];
    priceRange: string;
    openingHours: object;
    menu: Array<{
        category: string;
        items: Array<{
            name: string;
            price: number;
            description: string;
            isVeg: boolean;
            isVegan: boolean;
            spiceLevel: number;
        }>;
    }>;
}
export interface IAttraction extends Document {
    name: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    category: string;
    entryFee: {
        adult: number;
        child: number;
        senior: number;
        currency: string;
    };
    timings: object;
    bestTimeToVisit: string;
    duration: string;
}
export interface IEvent extends Document {
    name: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    category: string;
    startDate: Date;
    endDate: Date;
    ticketPrice: {
        min: number;
        max: number;
        currency: string;
    };
    organizer: object;
    capacity: number;
    isRecurring: boolean;
}
export interface IUser extends Document {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    password?: string;
    role: string;
    provider?: string;
    providerId?: string;
    profile?: object;
    preferences?: object;
    resetToken?: string;
    resetTokenExpiry?: Date;
    phone?: string;
    businessName?: string;
    businessType?: string;
    city?: string;
    membershipType?: string;
    status?: string;
    emailVerified?: boolean;
    lastLogin?: Date;
    bookingHistory?: Array<{
        type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports';
        itemId: mongoose.Types.ObjectId;
        itemName: string;
        bookingDate: Date;
        visitDate?: Date;
        status: 'confirmed' | 'cancelled' | 'completed';
        amount?: number;
        currency?: string;
        notes?: string;
    }>;
    wishlist?: Array<{
        type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports';
        itemId: mongoose.Types.ObjectId;
        itemName: string;
        addedDate: Date;
        notes?: string;
    }>;
}
export interface ITrip extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    destinations: Array<{
        location: {
            name: string;
            coordinates: [number, number];
        };
        arrivalDate: Date;
        departureDate: Date;
        activities: Array<{
            type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports' | 'transport';
            itemId?: mongoose.Types.ObjectId;
            itemName: string;
            time?: Date;
            notes?: string;
        }>;
        notes?: string;
    }>;
    totalBudget?: number;
    currency: string;
    status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
    isPublic: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface ITravel extends Document {
    name: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    category: string;
    transportType: 'air' | 'train' | 'bus' | 'taxi' | 'metro' | 'tram';
    from: string;
    to: string;
    duration: string;
    frequency: string;
    priceRange: {
        min: number;
        max: number;
        currency: string;
    };
    contact: {
        phone: string;
        email?: string;
        website?: string;
    };
    features: string[];
    operatingHours?: {
        open: string;
        close: string;
        closedDays: string[];
    };
    isActive: boolean;
}
export interface ITravelTip extends Document {
    title: string;
    description: string;
    category: 'general' | 'transport' | 'safety' | 'culture' | 'food' | 'shopping';
    icon: string;
    priority: number;
    isActive: boolean;
}
export interface ITrip extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    destinations: Array<{
        location: {
            name: string;
            coordinates: [number, number];
        };
        arrivalDate: Date;
        departureDate: Date;
        activities: Array<{
            type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports' | 'transport';
            itemId?: mongoose.Types.ObjectId;
            itemName: string;
            time?: Date;
            notes?: string;
        }>;
        notes?: string;
    }>;
    totalBudget?: number;
    currency: string;
    status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
    isPublic: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface IEmergencyContact extends Document {
    service: string;
    number: string;
    description: string;
    category: 'police' | 'medical' | 'fire' | 'tourist' | 'other';
    isActive: boolean;
}
export interface ISports extends Document {
    name: string;
    description: string;
    shortDescription: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    address: {
        street: string;
        area: string;
        city: string;
        state: string;
        pincode: string;
        landmark: string;
    };
    contact: {
        phone: string[];
        email: string;
        website: string;
        socialMedia: object;
    };
    category: 'Stadium' | 'Sports Grounds' | 'Coaching Centers' | 'Sports Clubs' | 'Sports Facilities';
    sport: string;
    capacity: number;
    facilities: string[];
    entryFee: {
        adult: number;
        child: number;
        senior: number;
        currency: string;
        isFree: boolean;
    };
    timings: {
        monday: {
            open: string;
            close: string;
            closed: boolean;
        };
        tuesday: {
            open: string;
            close: string;
            closed: boolean;
        };
        wednesday: {
            open: string;
            close: string;
            closed: boolean;
        };
        thursday: {
            open: string;
            close: string;
            closed: boolean;
        };
        friday: {
            open: string;
            close: string;
            closed: boolean;
        };
        saturday: {
            open: string;
            close: string;
            closed: boolean;
        };
        sunday: {
            open: string;
            close: string;
            closed: boolean;
        };
    };
    bestTimeToVisit: string;
    duration: string;
    amenities: string[];
    rating: {
        average: number;
        count: number;
    };
    tags: string[];
    status: string;
    featured: boolean;
    promoted: boolean;
    osmId: number;
    source: string;
}
export interface IPromotion extends Document {
    title: string;
    description: string;
    business: mongoose.Types.ObjectId;
    discountPercent: number;
    validFrom: Date;
    validUntil: Date;
    code: string;
    isActive: boolean;
}
export interface IContact extends Document {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    createdAt: Date;
    updatedAt: Date;
    respondedAt?: Date;
    response?: string;
    respondedBy?: mongoose.Types.ObjectId;
    viewedAt?: Date;
    viewedBy?: mongoose.Types.ObjectId;
    viewCount?: number;
}
export interface IFeedback extends Document {
    type: 'general' | 'bug' | 'feature' | 'content' | 'design' | 'other';
    subject: string;
    message: string;
    email?: string;
    rating?: number;
    likes?: string[];
    dislikes?: string[];
    status: 'new' | 'reviewed' | 'implemented' | 'declined';
    priority: 'low' | 'medium' | 'high';
    category: string;
    createdAt: Date;
    updatedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    notes?: string;
    viewedAt?: Date;
    viewedBy?: mongoose.Types.ObjectId;
    viewCount?: number;
}
export interface ISubmission extends Document {
    type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports' | 'travel';
    title: string;
    description: string;
    userId: mongoose.Types.ObjectId;
    submissionData: Record<string, unknown>;
    status: 'pending' | 'approved' | 'rejected';
    adminId?: mongoose.Types.ObjectId;
    adminNotes?: string;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IReportIssue extends Document {
    type: 'inaccurate' | 'outdated' | 'closed' | 'inappropriate' | 'spam' | 'other';
    businessName: string;
    location?: string;
    description: string;
    evidence?: string;
    email?: string;
    status: 'new' | 'investigating' | 'resolved' | 'dismissed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    createdAt: Date;
    updatedAt: Date;
    investigatedAt?: Date;
    investigatedBy?: mongoose.Types.ObjectId;
    resolution?: string;
    actionTaken?: string;
    viewedAt?: Date;
    viewedBy?: mongoose.Types.ObjectId;
    viewCount?: number;
}
export interface ISetting extends Document {
    category: string;
    key: string;
    value: unknown;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description?: string;
    isPublic: boolean;
    updatedBy?: mongoose.Types.ObjectId;
    updatedAt: Date;
}
export declare const Hotel: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Restaurant: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Attraction: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Event: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Travel: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const TravelTip: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Trip: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const EmergencyContact: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const User: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Promotion: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Sports: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Contact: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Feedback: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const ReportIssue: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Submission: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Setting: mongoose.Model<any, {}, {}, {}, any, any>;
export { Review } from './Review';
//# sourceMappingURL=index.d.ts.map