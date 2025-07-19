import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log(`\n mongoDB connected !! dbHost: ${connectionInstance.connection.host}`);
       
    } catch (error) {
        console.log("db.js catch mongodb connection error", error);  
        process.exit(1);  
    }
}