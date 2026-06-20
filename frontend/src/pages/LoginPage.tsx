import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Card, Field } from "../components/ui/primitives";
import { login, googleLoginUrl } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { GoogleIcon } from "../components/ui/GoogleIcon";

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user, accessToken } = await login(email, password);
      setSession(user, accessToken);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Couldn't log in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="font-display text-2xl font-semibold block text-center mb-8">
          Tab
        </Link>
        <Card className="p-8">
          <h1 className="font-display text-2xl font-medium mb-1">Welcome back</h1>
          <p className="text-ink-soft text-sm mb-6">Log in to see your tab.</p>

          <a
            href={googleLoginUrl()}
            className="w-full flex items-center justify-center gap-3 border border-rule rounded-lg py-2.5 mb-5 hover:bg-paper-dim transition-colors font-medium text-sm"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px bg-rule flex-1" />
            <span className="text-xs text-ink-soft">or</span>
            <div className="h-px bg-rule flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
            />
            <Field
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {error && <p className="text-sm text-debit">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>
        </Card>
        <p className="text-center text-sm text-ink-soft mt-6">
          New here?{" "}
          <Link to="/signup" className="text-credit font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
