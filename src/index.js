//require('dotenv').config({path : './env'})
import dotenv from "dotenv"
dotenv.config(
    {path: './env'}
)

import { connectDB } from "./db/db.js";

connectDB();















// another approach

// import express from "express";
// const app = express();

// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//         app.on("error",(error => {
//             console.log("try-mongodb-error", error);
//             throw error;           
//         }));

//         app.listen(process.env.PORT, () => {
//             console.log(`app is listening on port ${process.env.PORT}`);          
//         })
//     } catch (error) {
//         console.error("catch-mongodb error : ",error);
//         throw error;
//     }
// })()