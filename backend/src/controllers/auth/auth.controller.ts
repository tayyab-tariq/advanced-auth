import { loginSchema, registerSchema } from './auth.schema';
import { Request, Response, NextFunction } from 'express';
import { createAccount, loginUser, refreshUserAccessToken } from '../../services/auth.service';
import { clearAuthCookies, getAccessTokenCookieOptions, getRefreshTokenCookieOptions, setAuthCookies } from '../../utils/cookies';
import { CREATED, OK, UNAUTHORIZED } from '../../constants/http';
import catchErrors from '../../utils/catchErrors';
import { verifyToken } from '../../utils/jwt';
import SessionModel from '../../models/session.model';
import appAssert from '../../utils/appAssert';

export const registerHandler = catchErrors(async (req: Request, res: Response) => {
    const request = registerSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });

    const { user, accessToken, refreshToken } = await createAccount(request);

    setAuthCookies({ res, accessToken, refreshToken });

    return res.status(CREATED).json(user);
});

export const loginHandler = catchErrors (async (req, res) => {
    const request = loginSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });

    const { accessToken, refreshToken } = await loginUser(request);

    // set cookies
    return setAuthCookies({ res, accessToken, refreshToken })
        .status(OK)
        .json({ message: "Login successful" });
});

export const logoutHandler = catchErrors (async (req, res) => {
    const accessToken = req.cookies.accessToken as string | undefined;    
    const { payload } = verifyToken(accessToken || "");

    if (payload) {
        // remove session from db
        await SessionModel.findByIdAndDelete(payload.sessionId);
    }

    // clear cookies
    return clearAuthCookies(res).status(OK).json({ message : 'Logout Successful'});

});

export const refreshHandler = catchErrors(async (req, res) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

    const { accessToken, newRefreshToken } = await refreshUserAccessToken(refreshToken);

    if (newRefreshToken){
        res.cookie(refreshToken, newRefreshToken, getRefreshTokenCookieOptions());
    } 

    return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({ message: "Access token refreshed" });
});

export const verifyEmailHandler = catchErrors(async (req, res) => {
    const { token } = req.params;
    
        
    return res.status(OK).json({ message: "Email verified successfully" });
    
});