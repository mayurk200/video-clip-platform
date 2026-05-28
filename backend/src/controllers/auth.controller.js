import authService from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    return successResponse(res, result, "Registration successful", 201);
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return successResponse(res, result, "Login successful");
  } catch (err) { next(err); }
}

export async function getProfile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return successResponse(res, { user });
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    return successResponse(res, { user });
  } catch (err) { next(err); }
}
