import { Router } from "express";
import { body } from "express-validator";
import { register, login, getProfile, updateProfile } from "../../controllers/auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { authLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validate,
  register
);

router.post(
  "/login",
  authLimiter,
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
  login
);

router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);

export default router;
