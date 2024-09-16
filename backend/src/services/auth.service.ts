import { CONFLICT, UNAUTHORIZED } from "../constants/http";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import { refreshTokenSignOptions, signToken } from "../utils/jwt";

type CreateAccountParams = {
    email: string;
    password: string;
    userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
    // verify email is not taken
    const existingUser = await UserModel.exists({
        email: data.email
    });
    appAssert(!existingUser, CONFLICT, "Email already in use");

    const user = await UserModel.create({
        email: data.email,
        password: data.password,
    });
    const userId = user._id;

    // create session
    const session = await SessionModel.create({
        userId,
        userAgent: data.userAgent,
    });

    const refreshToken = signToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions
    );

    const accessToken = signToken({
    userId,
    sessionId: session._id,
    });

    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken
    };
};


type LoginParams = {
    email: string;
    password: string;
    userAgent?: string;
};

export const loginUser = async ({
    email,
    password,
    userAgent
}: LoginParams) => {
    const user = await UserModel.findOne({ email });
    appAssert(user, UNAUTHORIZED, 'Invalid email or password');
    
    return {
        user: user?.omitPassword()
    };
}