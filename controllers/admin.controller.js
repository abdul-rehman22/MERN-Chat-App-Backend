import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Request } from "../models/request.model.js";
import { Message } from "../models/message.model.js";

import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken";

import { cookieOptions } from "../utils/features.js";
import { adminSecretkey } from "../app.js";

const adminLogin = TryCatch(async (req, res, next) => {
  const { secretKey } = req.body;

  const isMatched = secretKey === adminSecretkey;
  if (!isMatched) {
    return next(new ErrorHandler("Invalid Secret Admin Key", 401));
  }

  const token = jwt.sign(secretKey, process.env.JWT_SECRET);

  res
    .cookie("admin_token", token, { ...cookieOptions, maxAge: 1000 * 60 * 15 })
    .json({
      status: "success",
      message: "Authenticated Successfully, Welcome BOSSSSSSSSS!",
    });
});

const adminLogout = TryCatch(async (req, res, next) => {
  res.clearCookie("admin_token").json({
    status: "success",
    message: "Admin Logout Successfully",
  });
});

const getAdminData = TryCatch(async (req, res, next) => {
  res.json({
    admin: true,
  });
});

const allUsers = TryCatch(async (req, res, next) => {
  const users = await User.find();

  const transformedUsers = await Promise.all(
    users.map(async ({ name, username, avatar, _id }) => {
      const [groups, friends] = await Promise.all([
        Chat.countDocuments({ groupChat: true, members: _id }),
        Chat.countDocuments({ groupChat: false, members: _id }),
      ]);

      return {
        name,
        username,
        _id,
        avatar: avatar.url,
        groups,
        friends,
      };
    })
  );

  res.json({
    status: "success",
    transformedUsers,
    message: "Users Fetch Successfully",
  });
});

const allChats = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({})
    .populate("members", "name avatar")
    .populate("creator", "name avatar");

  const transformedChats = await Promise.all(
    chats.map(async ({ members, _id, groupChat, name, creator }) => {
      const totalMessages = await Message.countDocuments({ chat: _id });
      return {
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
        members: members.map(({ _id, name, avatar }) => ({
          _id,
          name,
          avatar: avatar.url,
        })),
        creator: {
          name: creator?.name || "None",
          avatar: creator?.avatar.url || "",
        },
        totalMessages,
        totalMembers: members.length,
      };
    })
  );

  res.json({
    status: "success",
    transformedChats,
    message: "Chats Fetch Successfully",
  });
});

const allMessages = TryCatch(async (req, res, next) => {
  const messages = await Message.find({})
    .populate("sender", "name avatar")
    .populate("chat", "groupChat");

  const transformedMessages = messages.map(
    ({ content, attachments, _id, sender, createdAt, chat }) => ({
      _id,
      attachments,
      content,
      createdAt,
      chat: chat._id,
      groupChat: chat.groupChat,
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
    })
  );

  res.json({
    status: "success",
    transformedMessages,
    message: "Messages Fetch Successfully",
  });
});

const getDashboardStats = TryCatch(async (req, res, next) => {
  const [groupsCount, usersCount, messagesCount, totalChatsCount] =
    await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments(),
      Message.countDocuments(),
      Chat.countDocuments({ groupChat: false }),
    ]);

  const today = new Date();
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const last7DaysMessages = await Message.find({
    createdAt: { $gte: last7Days, $lte: today },
  }).select("createdAt");

  const messages = new Array(7).fill(0);
  const dayInMilliSeconds = 1000 * 60 * 60 * 24;
  last7DaysMessages.map((message) => {
    const indexApprox =
      (today.getTime() - message.createdAt.getTime()) / dayInMilliSeconds;
    const index = Math.floor(indexApprox);

    messages[6 - index]++;
  });

  const stats = {
    groupsCount,
    usersCount,
    messagesCount,
    totalChatsCount,
    messagesChart: messages,
  };
  res.json({
    status: "success",
    stats,
    message: "Dashboard Stats Fetch Successfully",
  });
});

export {
  allUsers,
  allChats,
  allMessages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData,
};
