import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Scissors, Sparkles, ArrowRight, Play, BarChart3, Captions } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "AI Viral Detection", desc: "Automatically finds the most engaging, shareable moments in your long-form content." },
  { icon: Scissors, title: "Smart Auto-Clipping", desc: "Cuts clips with perfect timing, normalized audio, and optimized encoding." },
  { icon: Captions, title: "Animated Captions", desc: "TikTok-style word-by-word captions with multiple premium styles." },
  { icon: Play, title: "Vertical Reframing", desc: "16:9 → 9:16 with AI face tracking to keep subjects perfectly centered." },
  { icon: Sparkles, title: "Hook Generation", desc: "AI rewrites weak openings into scroll-stopping curiosity hooks." },
  { icon: BarChart3, title: "Viral Score Engine", desc: "Multi-dimensional scoring: emotion, curiosity, engagement, storytelling." },
];

/**
 * Landing page — hero + features + CTA.
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Floating nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold gradient-text">ClipForge AI</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium transition-colors glow-btn"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* BG orbs */}
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold mb-6 uppercase tracking-wider">
              AI-Powered Video Clipping
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              Turn Long Videos Into{" "}
              <span className="gradient-text">Viral Clips</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10">
              ClipForge uses AI to detect high-retention moments, generate captions, reframe vertically, and produce export-ready clips for TikTok, Reels & Shorts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-lg transition-colors glow-btn flex items-center gap-2"
            >
              Start Clipping Free <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-[var(--color-text-secondary)] font-medium text-lg transition-colors"
            >
              View Demo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Go <span className="gradient-text">Viral</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 hover:border-[var(--color-border-hover)] transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
                  <Icon size={20} className="text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 px-6 text-center text-sm text-[var(--color-text-muted)]">
        © 2026 ClipForge AI. Built for creators who move fast.
      </footer>
    </div>
  );
}
