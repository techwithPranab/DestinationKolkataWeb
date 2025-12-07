import mongoose, { Document } from 'mongoose';
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
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Sports: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=Sports.d.ts.map