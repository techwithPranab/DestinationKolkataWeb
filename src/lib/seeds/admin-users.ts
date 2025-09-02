// Admin user seed data for Destination Kolkata
export const adminUserSeeds = [
  {
    id: '1',
    email: 'admin@destinationkolkata.com',
    password: 'admin123', // In production, this should be hashed with bcrypt
    name: 'System Administrator',
    role: 'admin',
    permissions: ['all'],
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null as string | null
  },
  {
    id: '2',
    email: 'manager@destinationkolkata.com',
    password: 'manager123',
    name: 'Content Manager',
    role: 'manager',
    permissions: ['read', 'write', 'update'],
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null as string | null
  },
  {
    id: '3',
    email: 'editor@destinationkolkata.com',
    password: 'editor123',
    name: 'Content Editor',
    role: 'editor',
    permissions: ['read', 'write'],
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null as string | null
  },
  {
    id: '4',
    email: 'viewer@destinationkolkata.com',
    password: 'viewer123',
    name: 'Content Viewer',
    role: 'viewer',
    permissions: ['read'],
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null as string | null
  }
]

export type AdminUser = typeof adminUserSeeds[0]

// Default admin credentials for easy access
export const DEFAULT_ADMIN = {
  email: 'admin@destinationkolkata.com',
  password: 'admin123'
}

export const DEFAULT_MANAGER = {
  email: 'manager@destinationkolkata.com',
  password: 'manager123'
}

export const DEFAULT_EDITOR = {
  email: 'editor@destinationkolkata.com',
  password: 'editor123'
}
