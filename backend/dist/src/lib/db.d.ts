import mongoose from 'mongoose';
interface GlobalMongoose {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
}
declare global {
    var mongoose: GlobalMongoose | undefined;
}
declare function dbConnect(): Promise<mongoose.Connection>;
export default dbConnect;
//# sourceMappingURL=db.d.ts.map