import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import useAuthStore from "@/store/authSlice";

/**
 * Register form component with name, email, password.
 */
export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) navigate("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Full Name
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError(); }}
            placeholder="John Doe"
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-active)] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Email
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError(); }}
            placeholder="you@example.com"
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-active)] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); }}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-active)] focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold transition-colors disabled:opacity-50 glow-btn"
      >
        {isLoading ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--color-primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
