import { NextFunction, Request, Response } from "express";
import { NOT_FOUND } from "../constants/http";

const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(NOT_FOUND);
    return res.json({
        message: error.message,
    });
}

export default notFound;