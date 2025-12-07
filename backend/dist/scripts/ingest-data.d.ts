interface OSMElement {
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    tags?: Record<string, string>;
    nodes?: number[];
    members?: Array<{
        type: string;
        ref: number;
        role: string;
    }>;
}
interface OSMResponse {
    elements: OSMElement[];
}
declare class DataIngestionService {
    private readonly overpassUrl;
    private readonly outputDir;
    constructor();
    fetchFromOverpass(query: string): Promise<OSMResponse>;
    getHotelsQuery(): string;
    getRestaurantsQuery(): string;
    getAttractionsQuery(): string;
    getSportsQuery(): string;
    processHotels(data: OSMResponse): {
        name: string;
        description: string;
        shortDescription: string;
        location: {
            type: string;
            coordinates: number[];
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
            socialMedia: {};
        };
        priceRange: {
            min: number;
            max: number;
            currency: string;
        };
        category: string;
        amenities: string[];
        rating: {
            average: number;
            count: number;
        };
        roomTypes: {
            name: string;
            price: number;
            capacity: number;
            amenities: string[];
            images: never[];
            available: boolean;
        }[];
        checkInTime: string;
        checkOutTime: string;
        tags: string[];
        status: string;
        featured: boolean;
        promoted: boolean;
        osmId: number;
        source: string;
    }[];
    processRestaurants(data: OSMResponse): {
        name: string;
        description: string;
        shortDescription: string;
        location: {
            type: string;
            coordinates: number[];
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
            socialMedia: {};
        };
        cuisine: string[];
        priceRange: string;
        openingHours: {
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
        menu: {
            category: string;
            items: {
                name: string;
                price: number;
                description: string;
                isVeg: boolean;
                isVegan: boolean;
                spiceLevel: number;
            }[];
        }[];
        amenities: string[];
        rating: {
            average: number;
            count: number;
        };
        deliveryPartners: string[];
        reservationRequired: boolean;
        avgMealCost: number;
        tags: string[];
        status: string;
        featured: boolean;
        promoted: boolean;
        osmId: number;
        source: string;
    }[];
    processAttractions(data: OSMResponse): {
        name: string;
        description: string;
        shortDescription: string;
        location: {
            type: string;
            coordinates: number[];
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
            socialMedia: {};
        };
        category: string;
        entryFee: {
            adult: number;
            child: number;
            senior: number;
            currency: string;
            isFree: boolean;
        } | {
            adult: number;
            child: number;
            senior: number;
            currency: string;
            isFree: boolean;
        } | {
            adult: number;
            child: number;
            senior: number;
            currency: string;
            isFree: boolean;
        } | {
            adult: number;
            child: number;
            senior: number;
            currency: string;
            isFree: boolean;
        } | {
            adult: number;
            child: number;
            senior: number;
            currency: string;
            isFree: boolean;
        } | {
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
        guidedTours: {
            available: boolean;
            languages: string[];
            price: number;
            duration: string;
        };
        accessibility: {
            wheelchairAccessible: boolean;
            parkingAvailable: boolean;
            publicTransport: string;
        };
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
    }[];
    processSports(data: OSMResponse): {
        name: string;
        description: string;
        shortDescription: string;
        location: {
            type: string;
            coordinates: number[];
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
            socialMedia: {};
        };
        category: string;
        sport: string;
        capacity: number;
        facilities: string[];
        entryFee: {
            adult: number;
            child: number;
            senior: number;
            currency: string;
            isFree: boolean;
        } | {
            adult: number;
            child: number;
            senior: number;
            currency: string;
            isFree: boolean;
        } | {
            adult: number;
            child: number;
            senior: number;
            currency: string;
            isFree: boolean;
        } | {
            adult: number;
            child: number;
            senior: number;
            currency: string;
            isFree: boolean;
        } | {
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
    }[];
    private categorizeHotel;
    private categorizeSports;
    private categorizeAttraction;
    private generateSportsDescription;
    private extractSportType;
    private estimateCapacity;
    private extractSportsFacilities;
    private generateSportsEntryFee;
    private getBestTimeForSports;
    private getSportsDuration;
    private extractSportsAmenities;
    private extractCuisine;
    private categorizePriceRange;
    private estimatePrice;
    private extractAmenities;
    private extractRestaurantAmenities;
    private extractAttractionAmenities;
    private extractTags;
    private parseOpeningHours;
    private generateSampleMenu;
    private generateAttractionDescription;
    private generateEntryFee;
    private getBestTimeToVisit;
    private getVisitDuration;
    private saveToFile;
    ingestAll(): Promise<void>;
    private generateSampleEvents;
    private generateSamplePromotions;
    private sleep;
}
export default DataIngestionService;
//# sourceMappingURL=ingest-data.d.ts.map