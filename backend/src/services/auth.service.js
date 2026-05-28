import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/database.js";
import config from "../config/index.js";

/**
 * Authentication service — register, login, profile.
 */
const authService = {
  async register(name, email, password) {
    const existing = db.users.findOne({ email });
    if (existing) throw Object.assign(new Error("Email already registered"), { statusCode: 409 });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = db.users.insert({ name, email, password: hashedPassword });

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  },

  async login(email, password) {
    const user = db.users.findOne({ email });
    if (!user) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  },

  async getProfile(userId) {
    const user = db.users.findOne({ id: userId });
    if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  },

  async updateProfile(userId, updates) {
    const user = db.users.updateOne({ id: userId }, updates);
    return { id: user.id, name: user.name, email: user.email };
  },
};

export default authService;
