import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler';
dotenv.config();

const port = process.env.PORT;
console.log(port);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: 'local',
        credentials: true,
    })
);

app.use(cookieParser());

app.get('/', (req, res) => {
    // return res.status(200).json({
    //     status: 'healthy',
    // });

    return res.status(200).send(req);
});


// error handler
app.use(errorHandler);

app.listen(port, async () => {
    console.log(`Server listening on port ${port} in ${process.env.NODE_ENV} environment`);
})