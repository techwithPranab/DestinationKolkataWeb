export declare const FOLDER_STRUCTURE: {
    readonly base: "destination-kolkata";
    readonly hotels: "destination-kolkata/hotels";
    readonly restaurants: "destination-kolkata/restaurants";
    readonly attractions: "destination-kolkata/attractions";
    readonly events: "destination-kolkata/events";
    readonly sports: "destination-kolkata/sports";
    readonly general: "destination-kolkata/general";
};
export type FolderType = keyof typeof FOLDER_STRUCTURE;
export declare function getCloudinaryFolder(type: FolderType): string;
export declare function getCloudinaryFolderFromPath(path: string): string;
export declare function generateSlug(text: string): string;
//# sourceMappingURL=cloudinary-utils.d.ts.map