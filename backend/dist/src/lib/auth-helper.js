"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatedUser = getAuthenticatedUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const next_1 = require("next-auth/next");
const route_1 = require("@/app/api/auth/[...nextauth]/route");
const mongodb_1 = require("@/lib/mongodb");
async function getAuthenticatedUser(req) {
    try {
        const session = await (0, next_1.getServerSession)(route_1.authOptions);
        if (session?.user?.email) {
            const { db } = await (0, mongodb_1.connectToDatabase)();
            const user = await db.collection('users').findOne({ email: session.user.email });
            if (user) {
                return {
                    userId: user._id.toString(),
                    role: user.role || 'customer',
                    email: user.email,
                    name: user.name
                };
            }
        }
    }
    catch (sessionError) {
        console.log('NextAuth session not found, trying JWT token...', sessionError instanceof Error ? sessionError.message : 'Unknown error');
    }
    const token = req.headers.get('authorization')?.replace('Bearer ', '') ||
        req.cookies.get('authToken')?.value ||
        req.cookies.get('adminToken')?.value;
    if (!token) {
        throw new Error('No authentication found');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return decoded;
    }
    catch (error) {
        console.error('Token verification failed:', error);
        throw new Error('Invalid token');
    }
}
//# sourceMappingURL=auth-helper.js.map