import axios from "axios";
import config from "../config/index.js";
import logger from "../utils/logger.js";

/**
 * Service to communicate with the Python AI microservice.
 */
const aiClient = axios.create({
  baseURL: config.aiService.url,
  timeout: 1800000, // 30 min default for long processing
});

const processingService = {
  /** Transcribe a video — uses extended timeout since CPU Whisper can be very slow */
  async transcribe(videoPath) {
    logger.info("Requesting transcription", { videoPath });
    const { data } = await aiClient.post(
      "/api/transcribe",
      { video_path: videoPath },
      { timeout: 5400000 } // 90 min — transcription on CPU can take 1-2x the video duration
    );
    return data;
  },

  /** Analyze transcript for viral moments */
  async analyzeTranscript(transcript, videoId) {
    logger.info("Requesting viral analysis", { videoId });
    const { data } = await aiClient.post("/api/analyze", { transcript, video_id: videoId });
    return data;
  },

  /** Generate clips from video */
  async generateClips(videoPath, clips) {
    logger.info("Requesting clip generation", { clipCount: clips.length });
    const { data } = await aiClient.post("/api/clips/generate", { video_path: videoPath, clips });
    return data;
  },

  /** Render final clip with captions + reframing */
  async renderClip(clipPath, options) {
    logger.info("Requesting clip render", { clipPath });
    const { data } = await aiClient.post("/api/render", { clip_path: clipPath, ...options });
    return data;
  },

  /** Generate hooks for a clip */
  async generateHooks(text) {
    const { data } = await aiClient.post("/api/hooks/generate", { text });
    return data;
  },

  /** Health check */
  async healthCheck() {
    const { data } = await aiClient.get("/health");
    return data;
  },
};

export default processingService;
