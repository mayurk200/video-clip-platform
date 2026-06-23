import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-8xl font-bold gradient-text-accent">404</div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
          <p className="text-sm text-text-muted max-w-md">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <Link to="/">
            <Button variant="accent" icon={Home}>Go to Dashboard</Button>
          </Link>
          <Button variant="secondary" icon={ArrowLeft} onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
