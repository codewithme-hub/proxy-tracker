import { useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

/**
 * On first mount, tries to silently refresh using the httpOnly cookie.
 * If it succeeds, the user is logged back in without re-entering credentials.
 * If it fails (no cookie / expired), we just land on the logged-out state.
 */
export function useAuthBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        if (!cancelled) {
          setSession(res.data.user, res.data.accessToken);
        }
      } catch {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
