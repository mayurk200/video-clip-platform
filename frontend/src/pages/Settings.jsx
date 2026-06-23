import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getSettings, updateSettings } from "../services/settings.service";
import {
  Settings2, Video, Type, Sparkles, Palette, Bot, HardDrive, Download, Save,
  CheckCircle, AlertCircle
} from "lucide-react";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("video");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) {
      setSaveMessage("Failed to save settings.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
    setIsSaving(false);
  };

  const handleChange = (category, field, value) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, [category]: { ...prev[category], [field]: value } };
    });
  };

  const tabs = [
    { id: "video", icon: Video, label: "Video Processing" },
    { id: "subtitles", icon: Type, label: "Subtitles" },
    { id: "titles", icon: Sparkles, label: "Title Generation" },
    { id: "grading", icon: Palette, label: "Color Grading" },
    { id: "ai", icon: Bot, label: "AI Providers" },
    { id: "export", icon: Download, label: "Export" },
    { id: "storage", icon: HardDrive, label: "Storage" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 size={22} className="text-accent" /> Settings
          </h1>
          <p className="text-sm text-text-muted mt-1">Configure the AI processing pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className={`flex items-center gap-1.5 text-xs ${saveMessage.includes("Failed") ? "text-danger" : "text-success"}`}>
              {saveMessage.includes("Failed") ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
              {saveMessage}
            </span>
          )}
          <Button variant="primary" icon={Save} loading={isSaving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab Nav */}
        <div className="w-full md:w-56 shrink-0 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sidebar-nav-item w-full ${activeTab === tab.id ? "active" : ""}`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? "text-accent" : ""} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "video" && (
            <div className="glass-panel-solid rounded-xl p-6 space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">Video Processing Pipeline</h2>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-border">
                <Toggle
                  checked={settings.video.enabled}
                  onChange={(v) => handleChange("video", "enabled", v)}
                  label="Enable Processing"
                  description="Master toggle for the AI video clipping engine"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Render Quality</label>
                  <select
                    value={settings.video.renderQuality}
                    onChange={(e) => handleChange("video", "renderQuality", e.target.value)}
                    className="input"
                  >
                    <option value="high">High (Slower)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low (Fastest)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">GPU Acceleration</label>
                  <select
                    value={settings.video.gpuAcceleration ? "true" : "false"}
                    onChange={(e) => handleChange("video", "gpuAcceleration", e.target.value === "true")}
                    className="input"
                  >
                    <option value="true">Enabled (CUDA/NVENC)</option>
                    <option value="false">Disabled (CPU Only)</option>
                  </select>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-border">
                <Toggle
                  checked={settings.video.cleanupTemp}
                  onChange={(v) => handleChange("video", "cleanupTemp", v)}
                  label="Auto-Cleanup Temp Files"
                  description="Delete intermediate FFmpeg artifacts automatically"
                />
              </div>
            </div>
          )}

          {activeTab === "subtitles" && (
            <div className="glass-panel-solid rounded-xl p-6 space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">Subtitle Generation Engine</h2>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-border">
                <Toggle
                  checked={settings.subtitles.enabled}
                  onChange={(v) => handleChange("subtitles", "enabled", v)}
                  label="Enable Subtitles"
                  description="Generate dynamic AI subtitles for all extracted clips"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Subtitle Style</label>
                  <select value={settings.subtitles.style} onChange={(e) => handleChange("subtitles", "style", e.target.value)} className="input">
                    <option value="hormozi">Alex Hormozi (Bold + Animated)</option>
                    <option value="clean">Clean & Minimal</option>
                    <option value="bold">High Impact (All Caps)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Caption Density</label>
                  <select value={settings.subtitles.density} onChange={(e) => handleChange("subtitles", "density", e.target.value)} className="input">
                    <option value="high">High (1-2 words)</option>
                    <option value="medium">Medium (Phrases)</option>
                    <option value="low">Low (Full Sentences)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Font Family</label>
                  <input type="text" value={settings.subtitles.fontFamily} onChange={(e) => handleChange("subtitles", "fontFamily", e.target.value)} className="input" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Position</label>
                  <select value={settings.subtitles.position} onChange={(e) => handleChange("subtitles", "position", e.target.value)} className="input">
                    <option value="top">Top Safe Zone</option>
                    <option value="middle">Center</option>
                    <option value="bottom">Bottom Safe Zone</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Font Size: {settings.subtitles.fontSize}px</label>
                  <input type="range" min="40" max="150" value={settings.subtitles.fontSize} onChange={(e) => handleChange("subtitles", "fontSize", parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Animation: {settings.subtitles.animationIntensity}%</label>
                  <input type="range" min="0" max="100" value={settings.subtitles.animationIntensity} onChange={(e) => handleChange("subtitles", "animationIntensity", parseInt(e.target.value))} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "titles" && (
            <div className="glass-panel-solid rounded-xl p-6 space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">AI Title Generation</h2>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-border">
                <Toggle
                  checked={settings.titles.enabled}
                  onChange={(v) => handleChange("titles", "enabled", v)}
                  label="Enable Title Overlay"
                  description="Render high-retention hook text in the top third of the video"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Target Platform</label>
                  <select value={settings.titles.targetPlatform} onChange={(e) => handleChange("titles", "targetPlatform", e.target.value)} className="input">
                    <option value="auto">Auto-Detect</option>
                    <option value="youtube">YouTube Shorts</option>
                    <option value="tiktok">TikTok</option>
                    <option value="reels">Instagram Reels</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Style Preference</label>
                  <select value={settings.titles.stylePreference} onChange={(e) => handleChange("titles", "stylePreference", e.target.value)} className="input">
                    <option value="auto">Auto-Select (Recommended)</option>
                    <option value="curiosity">Curiosity Gap</option>
                    <option value="shock">Shock/Mistake</option>
                    <option value="story">Storytelling</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Candidates: {settings.titles.candidateCount}</label>
                  <input type="range" min="5" max="50" step="5" value={settings.titles.candidateCount} onChange={(e) => handleChange("titles", "candidateCount", parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">CTR Optimization: {settings.titles.ctrOptimization}%</label>
                  <input type="range" min="0" max="100" value={settings.titles.ctrOptimization} onChange={(e) => handleChange("titles", "ctrOptimization", parseInt(e.target.value))} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "grading" && (
            <div className="glass-panel-solid rounded-xl p-6 space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">Color Grading & Enhancement</h2>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-border">
                <Toggle
                  checked={settings.grading.enabled}
                  onChange={(v) => handleChange("grading", "enabled", v)}
                  label="Enable Color Grading"
                  description="Apply visual enhancements via FFmpeg eq filters"
                />
              </div>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-border">
                <Toggle
                  checked={settings.grading.aiGrading}
                  onChange={(v) => handleChange("grading", "aiGrading", v)}
                  label="AI Grading Recommendations"
                  description="Let AI analyze scene category and adjust contrast/saturation automatically"
                />
              </div>
              {!settings.grading.aiGrading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 border border-border rounded-lg">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-secondary">Preset</label>
                    <select value={settings.grading.preset} onChange={(e) => handleChange("grading", "preset", e.target.value)} className="input">
                      <option value="none">Manual / None</option>
                      <option value="vibrant">Vibrant & Punchy</option>
                      <option value="cinematic">Cinematic Muted</option>
                      <option value="podcast">Podcast Balanced</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "ai" && (
            <div className="glass-panel-solid rounded-xl p-6 space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">AI Providers & Keys</h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Groq API Key</label>
                  <input
                    type="password"
                    value={settings.ai.groqApiKey}
                    onChange={(e) => handleChange("ai", "groqApiKey", e.target.value)}
                    placeholder="gsk_..."
                    className="input font-mono text-xs"
                  />
                  <p className="text-[10px] text-text-faint">Used for transcription and Llama 3 analysis</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-secondary">Groq LLM Model</label>
                    <select value={settings.ai.groqModel} onChange={(e) => handleChange("ai", "groqModel", e.target.value)} className="input">
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-secondary">Transcription Engine</label>
                    <select value={settings.ai.whisperMode} onChange={(e) => handleChange("ai", "whisperMode", e.target.value)} className="input">
                      <option value="groq">Groq Cloud (Fastest)</option>
                      <option value="local">Local CPU (Very Slow)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="glass-panel-solid rounded-xl p-6 space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">Export Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Target Resolution</label>
                  <select value={settings.export.resolution} onChange={(e) => handleChange("export", "resolution", e.target.value)} className="input">
                    <option value="1080x1920">1080×1920 (Vertical HD)</option>
                    <option value="720x1280">720×1280 (Vertical SD)</option>
                    <option value="1920x1080">1920×1080 (Horizontal HD)</option>
                    <option value="1080x1080">1080×1080 (Square)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Target FPS</label>
                  <select value={settings.export.fps} onChange={(e) => handleChange("export", "fps", parseInt(e.target.value))} className="input">
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Video Bitrate</label>
                  <select value={settings.export.bitrate} onChange={(e) => handleChange("export", "bitrate", e.target.value)} className="input">
                    <option value="5M">5 Mbps</option>
                    <option value="8M">8 Mbps (Recommended)</option>
                    <option value="12M">12 Mbps (High Quality)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Export Format</label>
                  <select value={settings.export.format} onChange={(e) => handleChange("export", "format", e.target.value)} className="input">
                    <option value="mp4">MP4 (H.264)</option>
                    <option value="mov">MOV (ProRes)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "storage" && (
            <div className="glass-panel-solid rounded-xl p-6 space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">Storage & Paths</h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Output Clips Folder</label>
                  <input type="text" value={settings.storage.clipFolder} onChange={(e) => handleChange("storage", "clipFolder", e.target.value)} className="input font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Temp Processing Folder</label>
                  <input type="text" value={settings.storage.tempFolder} onChange={(e) => handleChange("storage", "tempFolder", e.target.value)} className="input font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Retention: {settings.storage.retentionDays} days</label>
                  <input type="range" min="1" max="30" value={settings.storage.retentionDays} onChange={(e) => handleChange("storage", "retentionDays", parseInt(e.target.value))} />
                  <p className="text-[10px] text-text-faint">Files older than this will be automatically purged.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
