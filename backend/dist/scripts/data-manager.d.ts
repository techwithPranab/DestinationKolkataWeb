#!/usr/bin/env node
import mongoose from 'mongoose';
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
interface LoadStats {
    total: number;
    success: number;
    failed: number;
    skipped: number;
    pending: number;
}
declare class DataIngestionManager {
    private readonly overpassUrl;
    private readonly outputDir;
    private stats;
    constructor();
    connectToDatabase(): Promise<void>;
    fetchFromOverpass(query: string): Promise<OSMResponse>;
    getHotelsQuery(): string;
    getRestaurantsQuery(): string;
    getAttractionsQuery(): string;
    getSportsQuery(): string;
    private processDataWithPendingStatus;
    processHotels(data: OSMResponse): any[];
    processRestaurants(data: OSMResponse): any[];
    processAttractions(data: OSMResponse): any[];
    processSports(data: OSMResponse): any[];
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
    loadDataToDatabase<T>(model: mongoose.Model<T>, data: any[], collectionName: string): Promise<LoadStats>;
    private generateSampleEvents;
    private generateSamplePromotions;
    private saveToFile;
    private generateStatisticsReport;
    private sleep;
    ingestAndLoadAll(): Promise<void>;
    loadExistingData(): Promise<void>;
}
export default DataIngestionManager;
//# sourceMappingURL=data-manager.d.ts.map