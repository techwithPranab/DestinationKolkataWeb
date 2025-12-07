"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOLDER_STRUCTURE = void 0;
exports.getCloudinaryFolder = getCloudinaryFolder;
exports.getCloudinaryFolderFromPath = getCloudinaryFolderFromPath;
exports.generateSlug = generateSlug;
exports.FOLDER_STRUCTURE = {
    base: 'destination-kolkata',
    hotels: 'destination-kolkata/hotels',
    restaurants: 'destination-kolkata/restaurants',
    attractions: 'destination-kolkata/attractions',
    events: 'destination-kolkata/events',
    sports: 'destination-kolkata/sports',
    general: 'destination-kolkata/general'
};
function getCloudinaryFolder(type) {
    return exports.FOLDER_STRUCTURE[type];
}
function getCloudinaryFolderFromPath(path) {
    const regex = /\/upload\/(?:v\d+\/)?(.+?)\//;
    const match = regex.exec(path);
    return match ? match[1] : exports.FOLDER_STRUCTURE.general;
}
function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
//# sourceMappingURL=cloudinary-utils.js.map