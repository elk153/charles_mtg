import { Link, Outlet, useLocation } from "react-router";
import { useAuth } from "../../app/AppProviders/AuthContext.ts";
import "./AuthPages.css";

export default function RequireAuth() {
  const { isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    const next = `${location.pathname}${location.search}${location.hash}`;

    return (
      <section className="auth-page" aria-labelledby="auth-required-title">
        <h1 id="auth-required-title">Sign in required</h1>
        <p>Sign in to view this page.</p>
        <Link
          className="auth-page__button-link"
          to={`/v2/login?next=${encodeURIComponent(next)}`}
        >
          Sign in
        </Link>
      </section>
    );
  }

  return <Outlet />;
}
