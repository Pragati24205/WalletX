// frontend/src/components/Auth.jsx
import React, { useState } from 'react';
import { WalletIcon } from './Icons';

export default function Auth({ mode = 'login', goToSignUp, goToLogin, onAuth }) {
  const isLogin = mode === "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = isLogin
        ? { email, password }
        : { name, email, password };

      await onAuth(payload); // parent handles API call + navigation
    } catch (err) {
      setError(err.message || "Authentication failed.");
    }

    setLoading(false);
  }

  return (
    <div className="auth-wrap">

      {/* HEADER */}
      <div className="auth-header">
        <div
          className="logo-circle"
          style={{
            background: "linear-gradient(135deg,var(--purple),var(--blue))",
            width: 70,
            height: 70,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
          }}
        >
          <WalletIcon />
        </div>

        <h3 style={{ margin: "14px 0 0", color: "var(--purple)" }}>
          {isLogin ? "WalletX" : "Create Account"}
        </h3>

        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          {isLogin ? "Welcome back!" : "Join WalletX today"}
        </p>
      </div>

      {/* FORM */}
      <form className="auth-form" onSubmit={submit} style={{ marginTop: 20 }}>

        {!isLogin && (
          <input
            className="input"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          className="input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="input"
          type="password"
          placeholder={isLogin ? "Enter your password" : "Create a password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div style={{ color: "red", marginTop: 6, fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          className="auth-action"
          type="submit"
          disabled={loading}
          style={{
            marginTop: 12,
            background: "linear-gradient(90deg,var(--purple),var(--blue))",
            border: "none",
            color: "white",
            padding: "12px 14px",
            borderRadius: 12,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
          }}
        >
          {loading ? "Please wait…" : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      {/* SWITCH MODE */}
      <div style={{ textAlign: "center", marginTop: 12 }}>
        {isLogin ? (
          <button className="link-btn" onClick={goToSignUp} style={{ color: "var(--purple)" }}>
            New user? Create an account
          </button>
        ) : (
          <button className="link-btn" onClick={goToLogin} style={{ color: "var(--purple)" }}>
            Already have an account? Login
          </button>
        )}
      </div>
    </div>
  );
}
