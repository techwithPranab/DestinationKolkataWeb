import mongoose, { Document } from 'mongoose';
export interface IPartnership extends Document {
    partnerName: string;
    partnerType: 'hotel' | 'restaurant' | 'travel-agency' | 'attraction' | 'event-organizer' | 'transport' | 'technology' | 'media' | 'government' | 'other';
    contactPerson: {
        name: string;
        designation: string;
        email: string;
        phone?: string;
    };
    companyDetails: {
        website?: string;
        address: {
            street?: string;
            city: string;
            state: string;
            pincode: string;
            country: string;
        };
        established?: Date;
        employeeCount?: string;
        description: string;
    };
    partnershipType: 'listing' | 'promotional' | 'strategic' | 'affiliate' | 'content' | 'technology' | 'event';
    proposedBenefits: string[];
    offerDetails?: string;
    expectedOutcome: string;
    duration?: {
        startDate: Date;
        endDate?: Date;
        renewable: boolean;
    };
    financialTerms?: {
        commissionRate?: number;
        flatFee?: number;
        revenueShare?: number;
        paymentTerms?: string;
    };
    status: 'inquiry' | 'under-review' | 'negotiation' | 'approved' | 'active' | 'paused' | 'terminated' | 'rejected';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: mongoose.Types.ObjectId;
    notes?: string;
    internalNotes?: string;
    documents?: {
        filename: string;
        url: string;
        uploadedAt: Date;
        type: 'contract' | 'proposal' | 'certificate' | 'other';
    }[];
    communicationLog?: {
        date: Date;
        type: 'email' | 'call' | 'meeting' | 'other';
        summary: string;
        nextAction?: string;
        nextActionDate?: Date;
        createdBy: mongoose.Types.ObjectId;
    }[];
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Partnership: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=Partnership.d.ts.map