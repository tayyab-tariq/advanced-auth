import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED } from "../constants/http";
import { verifyToken } from "../utils/jwt";
import catchErrors from "../utils/catchErrors";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
    userId?: string;  // Marked as optional in case it's missing
    sessionId?: string;
}


// wrap with catchErrors() if you need this to be async
const authenticate: RequestHandler = catchErrors( async (req: AuthRequest, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken as string | undefined
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Not authorized",
    AppErrorCode.InvalidAccessToken
  );

  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );

  req.userId = payload.userId as string | undefined;
  req.sessionId = payload.sessionId as string | undefined;
  next();
});

export default authenticate;