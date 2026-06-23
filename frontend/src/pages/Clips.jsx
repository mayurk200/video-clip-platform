import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Upload } from "lucide-react";
import ClipGrid from "@/components/clips/ClipGrid";
import Button from "@/components/ui/Button";
import clipService from "@/services/clipService";

export default function Clips() {
  const [clips, setClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClips = async () => {
      try {
        const res = await clipService.listRecent(50);
        if (res.clips) setClips(res.clips);
      } catch (e) {
        console.error("Failed to load clips", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadClips();
  }, []);

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
            <Zap size={22} className="text-yellow-500" /> My Clips
          </h1>
          <p className="text-sm text-text-muted mt-1">All your AI-generated viral clips in one place.</p>
        </div>
        <Link to="/upload">
          <Button variant="accent" icon={Upload}>Upload Video</Button>
        </Link>
      </motion.div>

      {/* Clip Grid */}
      <ClipGrid
        clips={clips}
        isLoading={isLoading}
        emptyAction={
          <Link to="/upload">
            <Button variant="accent" icon={Upload}>Upload Your First Video</Button>
          </Link>
        }
      />
    </div>
  );
}
