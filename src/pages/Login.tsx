import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import type { AxiosError } from "axios";
import { useAuth } from "../context/AuthContext";
import "../style/Login.css";

interface LocationState {
  from?: { pathname: string };
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const state = location.state as LocationState | null;
  const from = state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          "Login failed. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__accent" />
        <div className="login-card__body">
          <div className="login-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V16M8 10V14M16 10V14"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2 className="login-heading">Sign in</h2>
          <p className="login-subtext">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="login-email">Email</label>
              <div className="login-input-wrap">
                <svg
                  className="login-input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6.5L12 13L21 6.5M4.5 5H19.5C20.3284 5 21 5.67157 21 6.5V17.5C21 18.3284 20.3284 19 19.5 19H4.5C3.67157 19 3 18.3284 3 17.5V6.5C3 5.67157 3.67157 5 4.5 5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <svg
                  className="login-input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="5"
                    y="10.5"
                    width="14"
                    height="9.5"
                    rx="1.6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M8 10.5V7.5C8 5.29086 9.79086 3.5 12 3.5C14.2091 3.5 16 5.29086 16 7.5V10.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  className="login-toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3 3L21 21M10.6 10.6C10.2 11 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 13 13.8 13.4 13.4M9.4 5.4C10.2 5.15 11.1 5 12 5C17 5 20.5 9 21.8 12C21.4 12.9 20.85 13.85 20.15 14.75M6.6 6.6C4.9 7.75 3.6 9.4 2.2 12C3.5 15 7 19 12 19C13.35 19 14.6 18.7 15.7 18.2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2.2 12C3.5 9 7 5 12 5C17 5 20.5 9 21.8 12C20.5 15 17 19 12 19C7 19 3.5 15 2.2 12Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12 8V13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="0.9" fill="currentColor" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading && <span className="login-spinner" aria-hidden="true" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}