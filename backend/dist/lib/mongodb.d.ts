import mongoose from 'mongoose';
import { MongoClient, Db } from 'mongodb';
declare global {
    var mongoose: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
    } | undefined;
    var mongoClient: {
        client: MongoClient | null;
        promise: Promise<MongoClient> | null;
    } | undefined;
}
declare function connectDB(): Promise<mongoose.Connection>;
export declare function connectToDatabase(): Promise<{
    client: MongoClient;
    db: Db;
}>;
export default connectDB;
//# sourceMappingURL=mongodb.d.ts.map