import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(cookieParser());

app.use(express.json({ limit: "16kb" })); //express.json is a method inbuilt in express to recognize the incoming Request Object as a JSON Object.



app.use(express.urlencoded({ extended: true, limit: "16kb" })); //express.urlencoded is a method inbuilt in express to recognize the incoming Request Object as strings or arrays.

app.use(express.static("public"));  //to save images in public folder and access them 

app.use(cookieParser()); //to parse cookies and save them in req.cookies 


app.use("/api/v1/users", userRouter);
export { app };