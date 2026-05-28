import { useCallback, useState } from "react";
import useVideoStore from "@/store/videoSlice";
import toast from "react-hot-toast";
import { SUPPORTED_VIDEO_FORMATS, MAX_UPLOAD_SIZE_BYTES } from "@/constants/platforms";

/**
 * Hook to handle video upload with validation.
 */
export default function useUpload() {
  const { uploadVideo, uploadLocalVideo, isUploading, uploadProgress } = useVideoStore();
  const [validationError, setValidationError] = useState(null);

  const validate = useCallback((file) => {
    if (!SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
      return "Unsupported video format. Use MP4, WebM, MOV, AVI, or MKV.";
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return "File too large. Maximum size is 2 GB.";
    }
    return null;
  }, []);

  const upload = useCallback(
    async (file) => {
      const error = validate(file);
      if (error) {
        setValidationError(error);
        toast.error(error);
        return null;
      }
      setValidationError(null);
      try {
        const result = await uploadVideo(file);
        toast.success("Video uploaded! Processing will begin shortly.");
        return result;
      } catch (err) {
        toast.error(err.response?.data?.message || "Upload failed");
        return null;
      }
    },
    [uploadVideo, validate]
  );

  const uploadLocalPath = useCallback(async (localPath) => {
    if (!localPath) {
      setValidationError("Please provide a local file path");
      return null;
    }
    setValidationError(null);
    try {
      const result = await uploadLocalVideo(localPath);
      toast.success("Local video copied and processing started!");
      return result;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to copy local file");
      return null;
    }
  }, [uploadLocalVideo]);

  return { upload, uploadLocalPath, isUploading, uploadProgress, validationError };
}
