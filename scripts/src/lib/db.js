"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    // During build time, don't throw error - just log warning
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE?.includes('build')) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }
    console.warn('MONGODB_URI not found - database operations will be skipped during build');
}
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
async function dbConnect() {
    // If no MongoDB URI, return a mock connection for build time
    if (!MONGODB_URI) {
        console.warn('No MONGODB_URI provided - returning mock connection for build time');
        // Return a mock connection object that won't break the build
        return {};
    }
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose_1.default.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose.connection;
        });
    }
    try {
        cached.conn = await cached.promise;
    }
    catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}
exports.default = dbConnect;
