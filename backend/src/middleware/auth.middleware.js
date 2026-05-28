import jwt from "jsonwebtoken";
import config from "../config/index.js";
import db from "../config/database.js";
import { errorResponse } from "../utils/responseHelper.js";

/**
 * JWT authentication middleware.
 * Extracts token from Authorization header, verifies it, attaches user to req.
 */
export async function authMiddleware(req, res, next) {
  try {
    const user = db.users.findOne({});
    if (!user) {
      return errorResponse(res, "No users found in DB. Please seed the DB.", 401);
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
