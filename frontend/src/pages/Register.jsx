import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
      setError("All fields are required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/register", form);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-badge auth-badge--alt">Create account</span>
          <h2>Join SmartShop</h2>
          <p>Create your account to browse products, place orders, and manage your profile.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </label>

          <label>
            Phone number
            <input
              type="tel"
              name="phone"
              placeholder="10-digit phone number"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </section>
    </main>
  );
}