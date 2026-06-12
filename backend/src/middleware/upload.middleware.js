import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import storage from "../config/storage.js";
import config from "../config/index.js";
import { ALLOWED_VIDEO_TYPES } from "../utils/validators.js";
import { ensureDir } from "../utils/fileUtils.js";

/**
 * Multer upload middleware for video files.
 */
const uploadStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname);
      let baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      if (baseName.length > 50) baseName = baseName.substring(0, 50);
      const shortId = uuidv4().slice(0, 8);
      const folderName = `${baseName}_${shortId}`;
      
      const videoDir = path.join(storage.root, folderName);
      const originalDir = path.join(videoDir, "original");
      const clipsDir = path.join(videoDir, "clips");
      const tempDir = path.join(videoDir, "temp");

      await ensureDir(originalDir);
      await ensureDir(clipsDir);
      await ensureDir(tempDir);

      // Store in request to access in controller if needed
      req.videoFolder = folderName;
      req.videoBaseDir = videoDir;

      cb(null, originalDir);
    } catch (err) {
      cb(err, storage.root);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    let baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_.-]/g, "_");
    if (baseName.length > 50) baseName = baseName.substring(0, 50);
    const sanitizedName = `${baseName}${ext}`;
    cb(null, sanitizedName);
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
