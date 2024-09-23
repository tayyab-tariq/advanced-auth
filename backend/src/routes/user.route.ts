import { Router } from "express";
import { getUserHandler, uploadUserAvatarHandler } from "../controllers/user/user.controller";
import avatarUpload from "../middleware/users/uploadAvatar";

const userRoutes = Router();

// prefix: /user
userRoutes.get("/", getUserHandler);
userRoutes.post("/profile", avatarUpload, uploadUserAvatarHandler);

export default userRoutes;