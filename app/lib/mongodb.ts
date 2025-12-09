// lib/mongodb.ts

// Import the main mongoose library
import mongoose from "mongoose";

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || "";

// Ensure the connection string exists
if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

// Use a global cache to avoid creating multiple connections during hot reloads
// (especially helpful in Next.js development)
let cached = (global as any).mongoose || { conn: null, promise: null };

// Main function to connect to MongoDB
export async function connectDB() {
    // If already connected, return the existing connection
    if (cached.conn) return cached.conn;

    // If no pending connection promise, create one
    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                // Explicitly define the database name
                dbName: "SchedDB_Name",
                // Prevent Mongoose from buffering commands when not connected
                bufferCommands: false,
            })
            // Resolve the promise to the mongoose instance
            .then((mongoose) => mongoose);
    }

    // Await the existing or newly created connection promise
    cached.conn = await cached.promise;
    return cached.conn;
}
