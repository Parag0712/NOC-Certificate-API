import express  from "express";
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"

export const app = express();


// Cross Origin Setup Here
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));


// Using This He can accept json data
app.use(express.json());
app.use(express.urlencoded({extended:true, limit: "16kb"}));

app.use(express.static("public"));
app.use(cookieParser());


// All Routes Are There

// Here User Routes 
import userRouter from './routes/user.route.js';
import certificateRouter from './routes/certificate.route.js';

app.use("/api/v1/users", userRouter);
app.use("/api/v1/certificate", certificateRouter);

app.get("/",(req,res)=>{
    res.send("Server running");
})

