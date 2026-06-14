import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "../services/settings.service";
import { 
  Settings2, Video, Type, Sparkles, Palette, Bot, HardDrive, Download, Save, 
  CheckCircle, AlertCircle 
} from "lucide-react";

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
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-muted">Loading Configuration...</p>
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
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      };
    });
  };

  const tabs = [
    { id: "video", icon: Video, label: "Video Processing" },
    { id: "subtitles", icon: Type, label: "Subtitle System" },
    { id: "titles", icon: Sparkles, label: "Title Generation" },
    { id: "grading", icon: Palette, label: "Color Grading" },
    { id: "ai", icon: Bot, label: "AI Providers" },
    { id: "export", icon: Download, label: "Export Settings" },
    { id: "storage", icon: HardDrive, label: "Storage" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-accent" />
            Web Control Center
          </h1>
          <p className="text-text-muted mt-1">Manage global configuration for the AI Pipeline</p>
        </div>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <span className={`flex items-center gap-2 text-sm ${saveMessage.includes('Failed') ? 'text-danger' : 'text-success'}`}>
              {saveMessage.includes('Failed') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {saveMessage}
            </span>
          )}
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn btn-primary px-6"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id 
                  ? "bg-white/10 text-white font-medium" 
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-accent" : ""}`} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-6">
          
          {activeTab === "video" && (
            <div className="glass-panel p-6 rounded-2xl animate-fade-in space-y-6">
              <h2 className="text-xl font-bold mb-4">Video Processing Pipeline</h2>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border">
                <div>
                  <h3 className="font-medium text-white">Enable Processing</h3>
                  <p className="text-sm text-text-muted">Master toggle for the AI video clipping engine</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.video.enabled} onChange={(e) => handleChange("video", "enabled", e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Render Quality</label>
                  <select 
                    value={settings.video.renderQuality} 
                    onChange={(e) => handleChange("video", "renderQuality", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="high">High (Slower)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low (Fastest)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">GPU Acceleration</label>
                  <select 
                    value={settings.video.gpuAcceleration ? "true" : "false"} 
                    onChange={(e) => handleChange("video", "gpuAcceleration", e.target.value === "true")}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="true">Enabled (CUDA/NVENC)</option>
                    <option value="false">Disabled (CPU Only)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border mt-4">
                <div>
                  <h3 className="font-medium text-white">Auto-Cleanup Temp Files</h3>
                  <p className="text-sm text-text-muted">Delete intermediate FFmpeg artifacts automatically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.video.cleanupTemp} onChange={(e) => handleChange("video", "cleanupTemp", e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === "subtitles" && (
            <div className="glass-panel p-6 rounded-2xl animate-fade-in space-y-6">
              <h2 className="text-xl font-bold mb-4">Subtitle Generation Engine</h2>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border">
                <div>
                  <h3 className="font-medium text-white">Enable Subtitles</h3>
                  <p className="text-sm text-text-muted">Generate dynamic AI subtitles for all extracted clips</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.subtitles.enabled} onChange={(e) => handleChange("subtitles", "enabled", e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Subtitle Style</label>
                  <select 
                    value={settings.subtitles.style} 
                    onChange={(e) => handleChange("subtitles", "style", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="hormozi">Alex Hormozi (Bold + Animated)</option>
                    <option value="clean">Clean & Minimal</option>
                    <option value="bold">High Impact (All Caps)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Caption Density</label>
                  <select 
                    value={settings.subtitles.density} 
                    onChange={(e) => handleChange("subtitles", "density", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="high">High (1-2 words)</option>
                    <option value="medium">Medium (Phrases)</option>
                    <option value="low">Low (Full Sentences)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Font Family</label>
                  <input 
                    type="text"
                    value={settings.subtitles.fontFamily} 
                    onChange={(e) => handleChange("subtitles", "fontFamily", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Font Size: {settings.subtitles.fontSize}px</label>
                  <input 
                    type="range" min="40" max="150"
                    value={settings.subtitles.fontSize} 
                    onChange={(e) => handleChange("subtitles", "fontSize", parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Animation Intensity: {settings.subtitles.animationIntensity}%</label>
                  <input 
                    type="range" min="0" max="100"
                    value={settings.subtitles.animationIntensity} 
                    onChange={(e) => handleChange("subtitles", "animationIntensity", parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Position</label>
                  <select 
                    value={settings.subtitles.position} 
                    onChange={(e) => handleChange("subtitles", "position", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="top">Top Safe Zone</option>
                    <option value="middle">Center</option>
                    <option value="bottom">Bottom Safe Zone</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "titles" && (
            <div className="glass-panel p-6 rounded-2xl animate-fade-in space-y-6">
              <h2 className="text-xl font-bold mb-4">AI Title Generation</h2>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border">
                <div>
                  <h3 className="font-medium text-white">Enable Title Overlay</h3>
                  <p className="text-sm text-text-muted">Render high-retention hook text in the top third of the video</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.titles.enabled} onChange={(e) => handleChange("titles", "enabled", e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Target Platform</label>
                  <select 
                    value={settings.titles.targetPlatform} 
                    onChange={(e) => handleChange("titles", "targetPlatform", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="auto">Auto-Detect</option>
                    <option value="youtube">YouTube Shorts</option>
                    <option value="tiktok">TikTok</option>
                    <option value="reels">Instagram Reels</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Style Preference</label>
                  <select 
                    value={settings.titles.stylePreference} 
                    onChange={(e) => handleChange("titles", "stylePreference", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="auto">Auto-Select (Recommended)</option>
                    <option value="curiosity">Curiosity Gap</option>
                    <option value="shock">Shock/Mistake</option>
                    <option value="story">Storytelling</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Candidate Generation Count: {settings.titles.candidateCount}</label>
                  <input 
                    type="range" min="5" max="50" step="5"
                    value={settings.titles.candidateCount} 
                    onChange={(e) => handleChange("titles", "candidateCount", parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">CTR Optimization Strength: {settings.titles.ctrOptimization}%</label>
                  <input 
                    type="range" min="0" max="100"
                    value={settings.titles.ctrOptimization} 
                    onChange={(e) => handleChange("titles", "ctrOptimization", parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "grading" && (
            <div className="glass-panel p-6 rounded-2xl animate-fade-in space-y-6">
              <h2 className="text-xl font-bold mb-4">Color Grading & Enhancement</h2>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border">
                <div>
                  <h3 className="font-medium text-white">Enable Color Grading</h3>
                  <p className="text-sm text-text-muted">Apply visual enhancements via FFmpeg eq filters</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.grading.enabled} onChange={(e) => handleChange("grading", "enabled", e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border">
                <div>
                  <h3 className="font-medium text-white">AI Grading Recommendations</h3>
                  <p className="text-sm text-text-muted">Let AI analyze scene category and adjust contrast/saturation automatically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.grading.aiGrading} onChange={(e) => handleChange("grading", "aiGrading", e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>

              {!settings.grading.aiGrading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-4 border border-border rounded-xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Preset</label>
                    <select 
                      value={settings.grading.preset} 
                      onChange={(e) => handleChange("grading", "preset", e.target.value)}
                      className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                    >
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
            <div className="glass-panel p-6 rounded-2xl animate-fade-in space-y-6">
              <h2 className="text-xl font-bold mb-4">AI Providers & Keys</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Groq API Key</label>
                  <input 
                    type="password"
                    value={settings.ai.groqApiKey} 
                    onChange={(e) => handleChange("ai", "groqApiKey", e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none font-mono text-sm"
                  />
                  <p className="text-xs text-text-muted">Used for Lightning-fast Whisper Transcription and Llama 3 Analysis</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Groq LLM Model</label>
                    <select 
                      value={settings.ai.groqModel} 
                      onChange={(e) => handleChange("ai", "groqModel", e.target.value)}
                      className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                    >
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Transcription Engine</label>
                    <select 
                      value={settings.ai.whisperMode} 
                      onChange={(e) => handleChange("ai", "whisperMode", e.target.value)}
                      className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                    >
                      <option value="groq">Groq Cloud (Fastest)</option>
                      <option value="local">Local CPU (Very Slow)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="glass-panel p-6 rounded-2xl animate-fade-in space-y-6">
              <h2 className="text-xl font-bold mb-4">Export Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Target Resolution</label>
                  <select 
                    value={settings.export.resolution} 
                    onChange={(e) => handleChange("export", "resolution", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="1080x1920">1080x1920 (Vertical HD)</option>
                    <option value="720x1280">720x1280 (Vertical SD)</option>
                    <option value="1920x1080">1920x1080 (Horizontal HD)</option>
                    <option value="1080x1080">1080x1080 (Square)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Target FPS</label>
                  <select 
                    value={settings.export.fps} 
                    onChange={(e) => handleChange("export", "fps", parseInt(e.target.value))}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS (Smoother Animations)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Video Bitrate</label>
                  <select 
                    value={settings.export.bitrate} 
                    onChange={(e) => handleChange("export", "bitrate", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="5M">5 Mbps</option>
                    <option value="8M">8 Mbps (Recommended)</option>
                    <option value="12M">12 Mbps (High Quality)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Export Format</label>
                  <select 
                    value={settings.export.format} 
                    onChange={(e) => handleChange("export", "format", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="mp4">MP4 (H.264)</option>
                    <option value="mov">MOV (ProRes)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "storage" && (
            <div className="glass-panel p-6 rounded-2xl animate-fade-in space-y-6">
              <h2 className="text-xl font-bold mb-4">Storage & Paths</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Output Clips Folder Path</label>
                  <input 
                    type="text"
                    value={settings.storage.clipFolder} 
                    onChange={(e) => handleChange("storage", "clipFolder", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Temporary Processing Folder</label>
                  <input 
                    type="text"
                    value={settings.storage.tempFolder} 
                    onChange={(e) => handleChange("storage", "tempFolder", e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-white focus:border-accent focus:outline-none font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Clip Retention Period (Days): {settings.storage.retentionDays}</label>
                  <input 
                    type="range" min="1" max="30"
                    value={settings.storage.retentionDays} 
                    onChange={(e) => handleChange("storage", "retentionDays", parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <p className="text-xs text-text-muted mt-1">Files older than this will be automatically purged by the backend cron job.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
