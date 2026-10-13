
import { useState } from "react";
import "./Auth.css";

const API = "http://localhost:8080/api/auth";

export default function Auth({ onSuccess }) {
  const [page, setPage] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/${page === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed.");

      if (page === "register") {
        setMessage("Account created successfully. Please log in.");
        setPage("login");
        setPassword("");
      } else {
        onSuccess(data);
      }
    } catch (error) {
      setMessage(error.message || "Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-decoration">
        <div className="auth-shield">🛡️</div>
        <h1>DeepFakeShield</h1>
        <p>See beyond the pixels. Protect the truth.</p>
        <div>✦ AI-powered media analysis</div>
        <div>✦ A safer digital experience</div>
      </aside>

      <main className="auth-panel">
        <section className="auth-card">
          <div className="auth-small-logo">🛡️ DeepFakeShield</div>
          <span className="auth-eyebrow">YOUR DIGITAL TRUST SPACE</span>
          <h2>{page === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="auth-subtitle">
            {page === "login"
              ? "Sign in to continue to your media analyzer."
              : "Create an account to get started."}
          </p>

          <div className="auth-tabs">
            <button type="button" className={page === "login" ? "active" : ""}
              onClick={() => { setPage("login"); setMessage(""); }}>Login</button>
            <button type="button" className={page === "register" ? "active" : ""}
              onClick={() => { setPage("register"); setMessage(""); }}>Register</button>
          </div>

          <form onSubmit={submit}>
            {page === "register" && (
              <label>Full name
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter your name" autoComplete="name"
                  maxLength={100} required />
              </label>
            )}

            <label>Email address
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" required />
            </label>

            <label>Password
              <input type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete={page === "login" ? "current-password" : "new-password"}
                minLength={page === "register" ? 8 : undefined} required />
            </label>

            {message && <div className="auth-message" role="status">{message}</div>}

            <button className="auth-submit" disabled={loading} type="submit">
              {loading ? "Please wait..." :
                page === "login" ? "Sign in →" : "Create account →"}
            </button>
          </form>

          <p className="auth-switch">
            {page === "login" ? "New to DeepFakeShield?" : "Already have an account?"}
            {" "}
            <button type="button" onClick={() => {
              setPage(page === "login" ? "register" : "login");
              setMessage("");
            }}>
              {page === "login" ? "Create account" : "Sign in"}
            </button>
          </p>

          <p className="auth-privacy">
            AI predictions are estimates, not proof of authenticity.
          </p>
        </section>
      </main>
    </div>
  );
}
