import { registerSchema } from './auth.schema';
import { Request, Response, NextFunction } from 'express';
import { createAccount } from '../../services/auth.service';
import { setAuthCookies } from '../../utils/cookies';
import { CREATED } from '../../constants/http';
import catchErrors from '../../utils/catchErrors';

export const registerHandler = catchErrors(async (req: Request, res: Response) => {
    const request = registerSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });

    const { user, accessToken, refreshToken } = await createAccount(request);

    setAuthCookies({ res, accessToken, refreshToken });

    return res.status(CREATED).json(user);
});