import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { fetchMe } from "../api/auth";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    const hash = window.location.hash; // "#token=..."
    const match = hash.match(/token=([^&]+)/);
    const token = match?.[1];

    if (!token) {
      navigate("/login?error=missing_token", { replace: true });
      return;
    }

    // Temporarily set the token so fetchMe's interceptor picks it up.
    useAuthStore.setState({ accessToken: token });

    fetchMe()
      .then((user) => {
        setSession(user, token);
        navigate(user.activeGroup ? "/dashboard" : "/onboarding", { replace: true });
      })
      .catch(() => {
        navigate("/login?error=google_auth_failed", { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <p className="font-display text-lg text-ink-soft animate-pulse">Signing you in…</p>
    </div>
  );
}
