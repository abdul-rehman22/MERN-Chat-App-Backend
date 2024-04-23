import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";
import { adminSecretkey } from "../app.js";
import { USER_TOKEN } from "../constants/config.js";
import { User } from "../models/user.model.js";

const isAuthenticated = (req, res, next) => {
  const token = req.cookies?.user_token;
  if (!token) {
    return next(new ErrorHandler("Please Login to access this route", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedData._id;
  next();
};

const isAdmin = (req, res, next) => {
  const token = req.cookies?.admin_token;
  if (!token) {
    return next(new ErrorHandler("Only Admin can access this route", 401));
  }

  const secretKey = jwt.verify(token, process.env.JWT_SECRET);
  const isMatched = secretKey === adminSecretkey;
  if (!isMatched) {
    return next(new ErrorHandler("Only Admin can access this route", 401));
  }

  next();
};
const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies[USER_TOKEN];

    if (!authToken)
      return next(new ErrorHandler("Please login to access this route", 401));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedData._id);

    if (!user)
      return next(new ErrorHandler("Please login to access this route", 401));

    socket.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Please login to access this route", 401));
  }
};

export { isAuthenticated, isAdmin, socketAuthenticator };
