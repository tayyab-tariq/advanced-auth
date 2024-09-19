import { APP_ORIGIN } from "../constants/env";
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeType";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import appAssert from "../utils/appAssert";
import { hashValue } from "../utils/bcrypt";
import { fiveMinutesAgo, ONE_DAY_MS, oneHourFromNow, thirtyDaysFromNow } from "../utils/date";
import { getPasswordResetTemplate, getVerifyEmailTemplate } from "../utils/emailTemplates";
import { RefreshTokenPayload, refreshTokenSignOptions, signToken, verifyToken } from "../utils/jwt";
import { sendMail } from "../utils/sendMail";

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


    const verificationCode = await VerificationCodeModel.create({
        userId,
        type: VerificationCodeType.EmailVerification,
        expiresAt: oneHourFromNow(),
    }); 
    const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;

    // send verification email
    try {
        const info = await sendMail({
            to: user.email,
            ...getVerifyEmailTemplate(url),
        });
        console.log("Email sent:", info);
    } catch (error) {
        // ignore email errors for now
        console.error("Error sending email:", error);
    }

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

    const isValid = await user.comparePassword(password);
    appAssert(isValid, UNAUTHORIZED, "Invalid email or password");

    const userId = user._id;
    const session = await SessionModel.create({
        userId,
        userAgent,
    });

    const sessionInfo: RefreshTokenPayload = {
        sessionId: session._id,
    };

    const refreshToken = signToken(
        sessionInfo,
        refreshTokenSignOptions
    );

    const accessToken = signToken({
        ...sessionInfo,
        userId,
    });
    
    return {
        user: user?.omitPassword(),
        accessToken,
        refreshToken,
    };
};

export const refreshUserAccessToken = async(refreshToken: string) => {
    const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
        secret: refreshTokenSignOptions.secret,
    });

    appAssert(payload, UNAUTHORIZED, 'Invalid refresh token');
    const session = await SessionModel.findById(payload.sessionId);

    const now = Date.now();
    appAssert(
        session && session.expiresAt.getTime() > now,
        UNAUTHORIZED,
        "Session expired"
    );

    // refresh the session if it expires in the next 24hrs
    const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;
    if (sessionNeedsRefresh) {
        session.expiresAt = thirtyDaysFromNow();
        await session.save();
    }

    const newRefreshToken = sessionNeedsRefresh ? signToken(
        {
            sessionId: session._id,
        },
        refreshTokenSignOptions
    ) : undefined;

    const accessToken = signToken({
        sessionId: session._id,
        userId: session.userId
    });

    return {
        accessToken,
        newRefreshToken
    };

};

export const verifyEmail = async (token: string) => {
    const validCode = await VerificationCodeModel.findOne({
        code: token,
        type: VerificationCodeType.EmailVerification,
        expiresAt: { $gt: new Date() }
    });
    appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

    const updatedUser = await UserModel.findByIdAndUpdate(
        validCode.userId,
        {
            verified: true,
        },
        { new: true }
    );

    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

    await validCode.deleteOne();
    return {
        user: updatedUser.omitPassword(),
    };
};


export const sendPasswordResetEmail = async (email: string) => {
    
    // Catch any errors that were thrown and log them (but always return a success)
  // This will prevent leaking sensitive data back to the client (e.g. user not found, email not sent).
  try {
    const user = await UserModel.findOne({ email });
    appAssert(user, NOT_FOUND, "User not found");

    const fiveMinAgo = fiveMinutesAgo();

    const count = await VerificationCodeModel.countDocuments({
        userId: user._id,
        type: VerificationCodeType.RESET_PASSWORD,
        createdAt: { $gte: fiveMinAgo }
    });

    appAssert(count <= 1, TOO_MANY_REQUESTS, "Too many requests, please try again later");

    const expiresAt = oneHourFromNow();
    const verificationCode = await VerificationCodeModel.create({
      userId: user._id,
      type: VerificationCodeType.RESET_PASSWORD,
      expiresAt,
    });

    const url = `${APP_ORIGIN}/password/reset?code=${
        verificationCode._id
    }&exp=${expiresAt.getTime()}`;
  
    try {
        const info = await sendMail({
            to: email,
            ...getPasswordResetTemplate(url),             // Check why spread operator is used
        });

        return {
            url,
            emailInfo: info,
        };
    } catch (error) {
        // ignore email errors for now
        console.error("Error sending email:", error);
        appAssert(
            error,
            INTERNAL_SERVER_ERROR,
            `${error}`
        );
    }
    
  } catch (error: any) {
    console.log("SendPasswordResetError:", error.message);
    return {};    
  }
}

type ResetPasswordParams = {
    password: string;
    verificationCode: string;
};
  
export const resetPassword = async ({
    verificationCode,
    password,
  }: ResetPasswordParams) => {
    const validCode = await VerificationCodeModel.findOne({
      _id: verificationCode,
      type: VerificationCodeType.RESET_PASSWORD,
      expiresAt: { $gt: new Date() },
    });
    appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");
  
    const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, {
      password: await hashValue(password),
    });
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to reset password");
  
    await validCode.deleteOne();
  
    // delete all sessions
    await SessionModel.deleteMany({ userId: validCode.userId });
  
    return { user: updatedUser.omitPassword() };
};