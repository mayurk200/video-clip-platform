import path from "path";
import { fileURLToPath } from "url";
import config from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Storage path configuration — resolves absolute paths for uploads, processed, clips, thumbnails.
 */
const storagePath = path.resolve(__dirname, "../../", config.storage.path);

const storage = {
  root: storagePath,
  uploads: path.join(storagePath, "uploads"),
  processed: path.join(storagePath, "processed"),
  clips: path.join(storagePath, "clips"),
  thumbnails: path.join(storagePath, "thumbnails"),
};

export default storage;
