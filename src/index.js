//require('dotenv').config({path : './env'})
import dotenv from "dotenv"
dotenv.config(
    {path: './.env'}
)

import { connectDB } from "./db/db.js";
import { app } from "./app.js";

connectDB()
.then(()=> {
    app.on("error", (error) => {
        console.error("index.js connectDb on error", error);     
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running on port: ${process.env.PORT}`);       
    })
})
.catch((error)=>{
    console.log("index.js connectDB failed", error);  
})















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