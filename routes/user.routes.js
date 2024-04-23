import { Router } from "express";
import {
  acceptFriendRequest,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
  getMyNotifications,
  getMyFriends,
} from "../controllers/user.controller.js";
import { singleAvatar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
} from "../lib/validators.js";

export const userRouter = Router();

userRouter.post("/login", loginValidator(), validateHandler, login);

userRouter.post(
  "/new",
  singleAvatar,
  registerValidator(),
  validateHandler,
  newUser
);

// Must Be login to access routes:
userRouter.use(isAuthenticated);

userRouter.get("/me", getMyProfile);

userRouter.get("/logout", logout);

userRouter.get("/search", searchUser);

userRouter.put(
  "/send-request",
  sendRequestValidator(),
  validateHandler,
  sendFriendRequest
);

userRouter.put(
  "/accept-request",
  acceptRequestValidator(),
  validateHandler,
  acceptFriendRequest
);

userRouter.get("/notifications", getMyNotifications);

userRouter.get("/friends", getMyFriends);
