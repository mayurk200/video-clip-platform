import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Film, AlertCircle, Scissors, File } from "lucide-react";
import useUpload from "@/hooks/useUpload";
import { formatFileSize } from "@/lib/utils";

const CLIP_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Minimalist ultra-premium clip count selector.
 */
function ClipCountSelector({ value, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Scissors size={14} className="text-zinc-500" />
        <span className="text-xs font-medium text-zinc-400">Target Output</span>
      </div>
      
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="appearance-none bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-zinc-200 py-1.5 pl-3 pr-8 rounded-md hover:bg-white/[0.05] hover:border-white/[0.15] transition-all focus:outline-none focus:border-zinc-500 cursor-pointer disabled:opacity-50"
        >
          {CLIP_OPTIONS.map((n) => (
            <option key={n} value={n}>{n} Clip{n !== 1 ? "s" : ""}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/**
 * Super subtle animated progress bar.
 */
function UploadProgress({ progress }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
      <div className="flex justify-between text-[11px] font-medium mb-2 uppercase tracking-widest text-zinc-500">
        <span>Uploading to Pipeline</span>
        <span className="text-zinc-300">{progress}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
          className="h-full bg-zinc-200"
        />
      </div>
    </motion.div>
  );
}

/**
 * Refined local path input.
 */
function LocalPathInput({ onSubmit, disabled }) {
  const [localPath, setLocalPath] = useState("");

  const handleSubmit = () => {
    if (localPath.trim()) {
      onSubmit(localPath.trim());
      setLocalPath("");
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-white/[0.05]">
      <div className="flex items-center gap-2 mb-3">
        <File size={12} className="text-zinc-500" />
        <span className="text-xs text-zinc-400 font-medium">Local Server Path</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={localPath}
          onChange={(e) => setLocalPath(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="e.g. C:\videos\podcast.mp4"
          className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 focus:bg-white/[0.04] text-zinc-200 placeholder:text-zinc-600 transition-all font-mono"
          disabled={disabled}
        />
        <button
          className="premium-btn px-4 py-2 text-sm disabled:opacity-40"
          disabled={disabled || !localPath.trim()}
          onClick={handleSubmit}
        >
          Inject
        </button>
      </div>
    </div>
  );
}

/**
 * Ultra-premium Dropzone with Vercel aesthetic.
 */
export default function DropzoneUploader() {
  const {
    upload,
    uploadLocalPath,
    isUploading,
    uploadProgress,
    validationError,
    desiredClipCount,
    setDesiredClipCount,
  } = useUpload();

  const onDrop = useCallback(
    (acceptedFiles) => { if (acceptedFiles.length > 0) upload(acceptedFiles[0]); },
    [upload]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".webm", ".mov", ".avi", ".mkv"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const activeFile = acceptedFiles[0];

  return (
    <div className="glass-panel inner-border rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl">
      
      {/* Top bar */}
      <ClipCountSelector value={desiredClipCount} onChange={setDesiredClipCount} disabled={isUploading} />

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`
          relative rounded-xl border border-dashed transition-all duration-300
          flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden
          ${isDragActive 
            ? "border-blue-500/50 bg-blue-500/[0.02]" 
            : "border-white/[0.1] hover:border-white/[0.2] bg-white/[0.01] hover:bg-white/[0.02]"
          }
          ${isUploading ? "py-10 pointer-events-none opacity-80 border-solid" : "py-16"}
        `}
      >
        <input {...getInputProps()} id="video-upload-input" />

        <AnimatePresence mode="wait">
          {activeFile && isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center animate-spin">
                <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full absolute top-1"></div>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-zinc-200 truncate max-w-[200px]">{activeFile.name}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{formatFileSize(activeFile.size)}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mb-4">
                {isDragActive 
                  ? <Upload size={18} className="text-blue-400" />
                  : <Film size={18} className="text-zinc-400" />
                }
              </div>
              <p className="text-sm font-medium text-zinc-200">
                {isDragActive ? "Drop to upload" : "Click or drag video"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                MP4, MOV, WebM up to 2GB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isUploading && <UploadProgress progress={uploadProgress} />}

      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex items-start gap-2 p-3 rounded-md bg-red-500/[0.05] border border-red-500/[0.1] text-[13px] text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{validationError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LocalPathInput onSubmit={uploadLocalPath} disabled={isUploading} />
    </div>
  );
}
