import fs from "fs";
import path from "path";
import logger from "../utils/logger.js";

const settingsPath = path.resolve(process.cwd(), "../storage/settings.json");

const defaultSettings = {
  video: {
    enabled: true,
    renderQuality: "high",
    gpuAcceleration: false,
    cleanupTemp: true,
  },
  subtitles: {
    enabled: true,
    style: "hormozi",
    density: "medium",
    animationIntensity: 25,
    fontSize: 90,
    fontFamily: "Arial Black",
    strokeSize: 8,
    shadowSize: 6,
    position: "bottom",
    aiCaptionThreshold: 0.8,
  },
  titles: {
    enabled: true,
    candidateCount: 20,
    ctrOptimization: 90,
    targetPlatform: "auto",
    stylePreference: "auto",
  },
  grading: {
    enabled: true,
    aiGrading: true,
    contrast: 1.0,
    saturation: 1.0,
    brightness: 0.0,
    sharpness: 1.0,
    preset: "none",
  },
  ai: {
    groqApiKey: process.env.GROQ_API_KEY || "",
    groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    whisperMode: "groq",
    requestLimits: 100,
    retryLimits: 3,
  },
  export: {
    resolution: "1080x1920",
    fps: 30,
    bitrate: "8M",
    format: "mp4",
    audioQuality: "192k",
  },
  storage: {
    clipFolder: "../storage/clips",
    tempFolder: "../storage/temp",
    retentionDays: 7,
  },
};

let currentSettings = { ...defaultSettings };

function loadSettings() {
  if (fs.existsSync(settingsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      // Merge with defaults to ensure all keys exist
      currentSettings = {
        video: { ...defaultSettings.video, ...data.video },
        subtitles: { ...defaultSettings.subtitles, ...data.subtitles },
        titles: { ...defaultSettings.titles, ...data.titles },
        grading: { ...defaultSettings.grading, ...data.grading },
        ai: { ...defaultSettings.ai, ...data.ai },
        export: { ...defaultSettings.export, ...data.export },
        storage: { ...defaultSettings.storage, ...data.storage },
      };
    } catch (e) {
      logger.error("Failed to parse settings.json, using defaults.");
    }
  } else {
    saveSettings(); // Create the file
  }
}

function saveSettings() {
  const dir = path.dirname(settingsPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(settingsPath, JSON.stringify(currentSettings, null, 2), "utf-8");
}

export function getSettings() {
  return currentSettings;
}

export function updateSettings(updates) {
  // Deep merge updates
  for (const category in updates) {
    if (currentSettings[category]) {
      currentSettings[category] = { ...currentSettings[category], ...updates[category] };
    }
  }
  saveSettings();
  return currentSettings;
}

loadSettings();
