import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, Film, AlertCircle, FileVideo } from "lucide-react";
import useUpload from "@/hooks/useUpload";
import { formatFileSize } from "@/lib/utils";

/**
 * Drag-and-drop video uploader with progress bar.
 */
export default function DropzoneUploader() {
  const { upload, uploadLocalPath, isUploading, uploadProgress, validationError } = useUpload();

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        upload(acceptedFiles[0]);
      }
    },
    [upload]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".webm", ".mov", ".avi", ".mkv"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive
            ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
            : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg-card)]"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input {...getInputProps()} id="video-upload-input" />

        <motion.div
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          className="flex flex-col items-center gap-4"
        >
          {acceptedFiles.length > 0 && isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-2 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                <FileVideo size={28} className="text-[var(--color-primary)] animate-pulse" />
              </div>
              <p className="text-lg font-semibold text-[var(--color-text-primary)] truncate max-w-[250px]">
                {acceptedFiles[0].name}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {formatFileSize(acceptedFiles[0].size)}
              </p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center transition-transform">
                {isDragActive ? <Film size={28} className="text-[var(--color-primary)]" /> : <Upload size={28} className="text-[var(--color-primary)]" />}
              </div>

              <div>
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {isDragActive ? "Drop your video here" : "Drag & drop your video"}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  or click to browse • MP4, WebM, MOV, AVI, MKV • Max 2 GB
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--color-text-secondary)]">Uploading…</span>
            <span className="text-[var(--color-primary)] font-medium">{uploadProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)]"
            />
          </div>
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div className="mt-4 flex items-center gap-2 text-sm text-red-400">
          <AlertCircle size={16} />
          {validationError}
        </div>
      )}

      {/* Local Path Form */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          placeholder="Or paste absolute local file path (e.g. C:\videos\podcast.mp4)" 
          className="flex-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] text-white"
          id="local-path-input"
        />
        <button 
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
          disabled={isUploading}
          onClick={() => {
            const input = document.getElementById("local-path-input").value;
            if (input) uploadLocalPath(input);
          }}
        >
          Copy Locally
        </button>
      </div>
    </div>
  );
}
