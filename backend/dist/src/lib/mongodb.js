"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE?.includes('build')) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }
    console.warn('MONGODB_URI not found - database operations will be skipped during build');
}
let cached = global.mongoose ?? { conn: null, promise: null };
let clientCached = global.mongoClient ?? { client: null, promise: null };
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
if (!clientCached) {
    clientCached = global.mongoClient = { client: null, promise: null };
}
async function connectDB() {
    if (!MONGODB_URI) {
        console.warn('No MONGODB_URI provided - returning mock connection for build time');
        return {};
    }
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 15000,
            family: 4,
            maxIdleTimeMS: 30000,
            retryWrites: true,
            retryReads: true
        };
        cached.promise = mongoose_1.default.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ Successfully connected to MongoDB');
            console.log('📊 MongoDB connection details:', {
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                name: mongoose.connection.name,
                readyState: mongoose.connection.readyState
            });
            return mongoose.connection;
        });
    }
    try {
        cached.conn = await cached.promise;
    }
    catch (e) {
        cached.promise = null;
        console.error('MongoDB connection error:', e);
        throw e;
    }
    return cached.conn;
}
async function connectToDatabase() {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI not found');
    }
    if (clientCached.client) {
        return {
            client: clientCached.client,
            db: clientCached.client.db()
        };
    }
    if (!clientCached.promise) {
        clientCached.promise = mongodb_1.MongoClient.connect(MONGODB_URI);
    }
    try {
        clientCached.client = await clientCached.promise;
        return {
            client: clientCached.client,
            db: clientCached.client.db()
        };
    }
    catch (e) {
        clientCached.promise = null;
        throw e;
    }
}
exports.default = connectDB;
//# sourceMappingURL=mongodb.js.map