import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  allChats,
  allMessages,
  allUsers,
  getAdminData,
  getDashboardStats,
} from "../controllers/admin.controller.js";
import { adminLoginValidator, validateHandler } from "../lib/validators.js";
import { isAdmin } from "../middlewares/auth.js";

export const adminRouter = Router();

adminRouter.post("/verify", adminLoginValidator(), validateHandler, adminLogin);
adminRouter.get("/logout", adminLogout);

adminRouter.use(isAdmin);

adminRouter.get("/", getAdminData);

adminRouter.get("/users", allUsers);
adminRouter.get("/chats", allChats);
adminRouter.get("/messages", allMessages);

adminRouter.get("/stats", getDashboardStats);
