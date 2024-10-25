import mongoose from 'mongoose';

export default async function dbConnect() {
    const uri = process.env.MONGODB_URI;
    const DB_NAME = process.env.DB_NAME;

    if (!uri) {
        throw new Error(
            'Please define the MONGODB_URI environment variable inside .env.local'
        );
    }
    if (mongoose.connection.readyState >= 1) {

        return mongoose.connection.asPromise();
    }

    return await mongoose.connect(`${uri}/${DB_NAME}`)
}
