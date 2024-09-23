import { NOT_FOUND, OK } from "../../constants/http";
import UserModel from "../../models/user.model";
import appAssert from "../../utils/appAssert";
import catchErrors from "../../utils/catchErrors";
import { Request, Response } from "express";

// Extend the Request type to include the userId property
interface UserRequest extends Request {
    userId?: string;
    files?: any;  // Marked as optional in case it's missing
}


export const getUserHandler = catchErrors(async (req: UserRequest, res: Response) => {
  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, "User not found");
  return res.status(OK).json(user.omitPassword());
});

export const uploadUserAvatarHandler = catchErrors(async (req: UserRequest, res: Response) => {
  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, "User not found");

  const defaultAvatar =
    "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg";

  const fileUrl = req.files?.[0]?.filename
    ? `${req.protocol}://${req.get("host")}/assets/userAvatars/${
        req.files[0].filename
      }`
    : defaultAvatar;

  
  // const avatar = req.file?.buffer;
  user.avatar = fileUrl;

  // await user.save();
  return res.status(OK).json(user.omitPassword());
});
