import { validationResult } from "express-validator";
import { errorResponse } from "../utils/responseHelper.js";

/**
 * Express-validator result checker middleware.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed", 422, errors.array());
  }
  next();
}
