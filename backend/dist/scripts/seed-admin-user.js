"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seedAdminUser() {
    try {
        console.log('🔄 Connecting to database...');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata';
        console.log('📍 MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
        });
        console.log('✅ Connected to database successfully!');
        const userSchema = new mongoose_1.default.Schema({
            firstName: String,
            lastName: String,
            email: { type: String, unique: true },
            password: String,
            role: { type: String, default: 'user' },
            phone: String,
            city: String,
            membershipType: { type: String, default: 'free' },
            status: { type: String, default: 'active' },
            emailVerified: { type: Boolean, default: false },
            profile: Object,
            preferences: Object,
            verification: Object,
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });
        const User = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
        console.log('🔍 Checking for existing admin user...');
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('📧 Email:', existingAdmin.email);
            console.log('🔗 Admin Panel: /admin/login');
            console.log('');
            console.log('💡 You can use this account to login to the admin panel.');
            await mongoose_1.default.disconnect();
            process.exit(0);
        }
        console.log('🆕 Creating new admin user...');
        const adminData = {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@destinationkolkata.com',
            password: await bcryptjs_1.default.hash('admin123', 12),
            role: 'admin',
            phone: '+91-9876543210',
            city: 'Kolkata',
            membershipType: 'premium',
            status: 'active',
            emailVerified: true,
            profile: {
                bio: 'System Administrator for Destination Kolkata',
                location: {
                    city: 'Kolkata',
                    state: 'West Bengal',
                    country: 'India'
                }
            },
            preferences: {
                emailNotifications: true,
                smsNotifications: false,
                language: 'en',
                currency: 'INR'
            },
            verification: {
                email: true,
                phone: true,
                business: false
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const adminUser = new User(adminData);
        await adminUser.save();
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@destinationkolkata.com');
        console.log('🔑 Password: admin123');
        console.log('🔗 Admin Panel: /admin/login');
        console.log('');
        console.log('⚠️  IMPORTANT: Please change the default password after first login!');
        console.log('');
        await mongoose_1.default.disconnect();
        console.log('🔌 Database connection closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding admin user:', error);
        if (error instanceof Error) {
            if (error.message.includes('ECONNREFUSED')) {
                console.log('');
                console.log('💡 Troubleshooting tips:');
                console.log('1. Make sure MongoDB is running: brew services start mongodb-community');
                console.log('2. Check if MongoDB is listening on the correct port: lsof -i :27017');
                console.log('3. Verify your MONGODB_URI in .env.local');
            }
            else if (error.message.includes('authentication failed')) {
                console.log('');
                console.log('💡 Troubleshooting tips:');
                console.log('1. Check your MongoDB credentials in MONGODB_URI');
                console.log('2. Make sure the database user has write permissions');
                console.log('3. Try using the local MongoDB URI: mongodb://localhost:27017/destination-kolkata');
            }
        }
        process.exit(1);
    }
}
seedAdminUser();
//# sourceMappingURL=seed-admin-user.js.map