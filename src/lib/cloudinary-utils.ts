// Cloudinary folder utilities
export const FOLDER_STRUCTURE = {
  base: 'destination-kolkata',
  hotels: 'destination-kolkata/hotels',
  restaurants: 'destination-kolkata/restaurants',
  attractions: 'destination-kolkata/attractions',
  events: 'destination-kolkata/events',
  sports: 'destination-kolkata/sports',
  general: 'destination-kolkata/general'
} as const

export type FolderType = keyof typeof FOLDER_STRUCTURE

export function getCloudinaryFolder(type: FolderType): string {
  return FOLDER_STRUCTURE[type]
}

export function getCloudinaryFolderFromPath(path: string): string {
  // Extract folder from existing Cloudinary URL
  const regex = /\/upload\/(?:v\d+\/)?(.+?)\//
  const match = regex.exec(path)
  return match ? match[1] : FOLDER_STRUCTURE.general
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}
