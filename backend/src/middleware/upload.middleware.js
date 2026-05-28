import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import storage from "../config/storage.js";
import config from "../config/index.js";
import { ALLOWED_VIDEO_TYPES } from "../utils/validators.js";
import { ensureDir } from "../utils/fileUtils.js";

// Ensure upload directory exists
await ensureDir(storage.uploads);

/**
 * Multer upload middleware for video files.
 */
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storage.uploads);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only video files are allowed."), false);
  }
};

export const uploadVideo = multer({
  storage: uploadStorage,
  fileFilter,
  limits: {
    fileSize: config.storage.maxUploadSizeMB * 1024 * 1024,
  },
}).single("video");
