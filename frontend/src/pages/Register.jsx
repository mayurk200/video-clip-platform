import RegisterForm from "@/components/auth/RegisterForm";

/**
 * Register page — wraps the RegisterForm in a card.
 */
export default function Register() {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold gradient-text mb-2">Create account</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Start turning videos into viral clips</p>
      </div>
      <RegisterForm />
    </div>
  );
}
