import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../app/AppProviders/AuthContext.ts";
import { supabase } from "../../services/supabaseClient.ts";
import {
  getAuthCallbackUrl,
  getSafeAuthDestination,
} from "./authRedirect.ts";
import "./AuthPages.css";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const next = getSafeAuthDestination(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && session) {
      navigate(next, { replace: true });
    }
  }, [isLoading, session, navigate, next]);

  async function handleSendLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: getAuthCallbackUrl(next),
      },
    });

    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setEmailSent(true);
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    if (!data.session) {
      setErrorMessage("The code was accepted but no session was created. Try again.");
      return;
    }

    navigate(next, { replace: true });
  }

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <h1 id="login-title">Sign in</h1>
      <p>Enter your email and we’ll send you a sign-in link.</p>

      <form className="auth-page__form" onSubmit={handleSendLink}>
        <label htmlFor="login-email">Email address</label>
        <input
          autoComplete="email"
          id="login-email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending…" : "Send sign-in link"}
        </button>
      </form>

      {emailSent && (
        <p className="auth-page__notice" role="status">
          Check your email for a sign-in link. If your email contains a
          six-digit code, you can enter it here instead.
        </p>
      )}

      <button
        aria-expanded={showCodeEntry}
        className="auth-page__secondary"
        onClick={() => {
          setShowCodeEntry((shown) => !shown);
          setErrorMessage(null);
        }}
        type="button"
      >
        {showCodeEntry ? "Use the sign-in link" : "Enter a six-digit email code"}
      </button>

      {showCodeEntry && (
        <form className="auth-page__form" onSubmit={handleVerifyCode}>
          <label htmlFor="login-code">Six-digit code</label>
          <input
            autoComplete="one-time-code"
            id="login-code"
            inputMode="numeric"
            maxLength={6}
            minLength={6}
            name="code"
            onChange={(event) => setCode(event.target.value)}
            pattern="[0-9]{6}"
            required
            type="text"
            value={code}
          />
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Verifying…" : "Verify code"}
          </button>
        </form>
      )}

      {errorMessage && (
        <p className="auth-page__error" role="alert">
          {errorMessage}
        </p>
      )}

      <Link className="auth-page__home-link" to="/v2/home">
        Return to home
      </Link>
    </section>
  );
}
