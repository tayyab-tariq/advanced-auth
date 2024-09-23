import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import helmet from "helmet";
import errorHandler from './middleware/errorHandler';
import { PORT, NODE_ENV, APP_ORIGIN } from './constants/env';
import connectToDatabase from "./config/db";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import authenticate from "./middleware/authenticate";
import { fileURLToPath } from 'url';
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use(
    cors({
        origin: APP_ORIGIN,
        credentials: true,
    })
);

// app.use(
//     "/assets/userAvatars",
//     express.static(__dirname + "/assets/userAvatars")
// );

app.use(cookieParser());

app.get('/', (req, res) => {
    return res.status(200).json({
        status: 'healthy',
    });
});

// auth routes
app.use("/auth", authRoutes);

// protected routes
app.use("/user", authenticate, userRoutes);

// error handler
app.use(errorHandler);

app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`);
    await connectToDatabase();
})