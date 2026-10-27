import { Link, Outlet, useLocation } from "react-router";
import { useAuth } from "../../app/AppProviders/AuthContext.ts";
import "./AuthPages.css";

export default function RequireAuth() {
  const { isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <section className="app-v2__page auth-page" aria-live="polite" aria-busy="true">
        <p>Checking your session…</p>
      </section>
    );
  }

  if (!user) {
    const nextPath = `${location.pathname}${location.search}${location.hash}`;
    const loginPath = `/v2/login?next=${encodeURIComponent(nextPath)}`;

    return (
      <section className="app-v2__page auth-page">
        <h1>Sign in required</h1>
        <p className="auth-page__intro">
          Sign in to access this page.
        </p>
        <Link className="auth-submit auth-submit--link" to={loginPath}>
          Sign in
        </Link>
      </section>
    );
  }

  return <Outlet />;
}
