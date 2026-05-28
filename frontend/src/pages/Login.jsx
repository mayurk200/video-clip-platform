import LoginForm from "@/components/auth/LoginForm";

/**
 * Login page — wraps the LoginForm in a card.
 */
export default function Login() {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold gradient-text mb-2">Welcome back</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Sign in to your ClipForge account</p>
      </div>
      <LoginForm />
    </div>
  );
}
