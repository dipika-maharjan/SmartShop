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

        <div className="auth-copy">
          <p className="auth-copy-title">Fast setup</p>
          <p className="auth-copy-text">
            One account for shopping, coupons, wishlist, invoices, and your order history.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Full name</span>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </label>

          <label className="auth-field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </label>

          <label className="auth-field">
            <span>Phone number</span>
            <input
              type="tel"
              name="phone"
              placeholder="10-digit phone number"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </label>

          <div className="auth-grid-two">
            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </label>

            <label className="auth-field">
              <span>Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </label>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-primary-btn" type="submit" disabled={loading}>
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