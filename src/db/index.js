import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export default async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Connected to DB", connectionInstance.connection.host)
    }
    catch (err) {
        console.log("MongoDB connection failed. Error is: ", err);
        throw err;
    }
}