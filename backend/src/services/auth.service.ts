import { CONFLICT } from "../constants/http";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";

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

    return {
        user: user.omitPassword()
    };
}