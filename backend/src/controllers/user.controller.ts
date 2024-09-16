import { NOT_FOUND, OK } from "../constants/http";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { Request, Response } from "express";

// Extend the Request type to include the userId property
interface UserRequest extends Request {
    userId?: string;  // Marked as optional in case it's missing
}


export const getUserHandler = catchErrors(async (req: UserRequest, res: Response) => {
  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, "User not found");
  return res.status(OK).json(user.omitPassword());
});