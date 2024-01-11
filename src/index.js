import 'dotenv/config'
import express from "express";
import connectDB from "./db/index.js";
import {app} from "./app.js";

// Connect to DB as soon as index is loaded
connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => console.log(`listening on port ${process.env.PORT}!`));
}).catch((err) => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
});
