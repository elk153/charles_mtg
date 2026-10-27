import { useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../app/AppProviders/AuthContext.ts";
import { getSafeAuthDestination } from "./authRedirect.ts";
import "./AuthPages.css";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const next = getSafeAuthDestination(searchParams.get("next"));
  const hashParams = new URLSearchParams(location.hash.slice(1));
  const authError =
    searchParams.get("error_description") ??
    hashParams.get("error_description") ??
    searchParams.get("error") ??
    hashParams.get("error");
  const authErrorCode =
    searchParams.get("error_code") ??
    hashParams.get("error_code") ??
    searchParams.get("error") ??
    hashParams.get("error");

  useEffect(() => {
    if (!isLoading && session) {
      navigate(next, { replace: true });
    }
  }, [isLoading, session, navigate, next]);

  if (isLoading) {
    return (
      <section className="auth-page" aria-live="polite">
        <h1>Signing you in</h1>
        <p>Confirming your email link…</p>
      </section>
    );
  }

  if (session) {
    return (
      <section className="auth-page" aria-live="polite">
        <h1>Signed in</h1>
        <p>Taking you back to the app…</p>
      </section>
    );
  }

  return (
    <section className="auth-page" aria-labelledby="auth-callback-title">
      <h1 id="auth-callback-title">We couldn’t complete sign-in</h1>
      <p className="auth-page__error" role="alert">
        {authError
          ? authError
          : "The sign-in link may have expired or already been used."}
      </p>
      <p>
        Request a new link, or use the six-digit code if your email includes
        one.
      </p>
      <details className="auth-page__diagnostics">
        <summary>Sign-in diagnostics (safe to share)</summary>
        <dl>
          <dt>Callback address</dt>
          <dd>
            {window.location.origin}
            {location.pathname}
          </dd>
          <dt>PKCE code received</dt>
          <dd>{searchParams.has("code") ? "Yes" : "No"}</dd>
          <dt>Supabase error code</dt>
          <dd>{authErrorCode ?? "None in callback URL"}</dd>
          <dt>Session detected</dt>
          <dd>{session ? "Yes" : "No"}</dd>
        </dl>
        <p>
          The PKCE code and email are intentionally not shown. Compare the
          callback address with the Supabase Auth redirect allow-list.
        </p>
      </details>
      <Link
        className="auth-page__button-link"
        to={`/v2/login?next=${encodeURIComponent(next)}`}
      >
        Return to sign in
      </Link>
    </section>
  );
}
