import { Router } from "express";
import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMembers,
  renameGroup,
  sendAttachments,
} from "../controllers/chat.controller.js";
import {
  addMemberValidator,
  chatIdValidator,
  newGroupValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachmentsValidator,
  validateHandler,
} from "../lib/validators.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { attachmentsMulter } from "../middlewares/multer.js";

export const chatRouter = Router();

// Must Be login to access routes:
chatRouter.use(isAuthenticated);

chatRouter
  .route("/new")
  .post(newGroupValidator(), validateHandler, newGroupChat);
chatRouter.route("/my").get(getMyChats);

chatRouter.route("/my/groups").get(getMyGroups);

chatRouter
  .route("/addMembers")
  .put(addMemberValidator(), validateHandler, addMembers);
chatRouter
  .route("/removeMember")
  .put(removeMemberValidator(), validateHandler, removeMembers);

chatRouter
  .route("/leave/:id")
  .delete(chatIdValidator(), validateHandler, leaveGroup);

chatRouter
  .route("/message")
  .post(
    attachmentsMulter,
    sendAttachmentsValidator(),
    validateHandler,
    sendAttachments
  );
chatRouter
  .route("/message/:id")
  .get(chatIdValidator(), validateHandler, getMessages);

chatRouter
  .route("/:id")
  .get(chatIdValidator(), validateHandler, getChatDetails)
  .put(renameValidator(), validateHandler, renameGroup)
  .delete(chatIdValidator(), validateHandler, deleteChat);
