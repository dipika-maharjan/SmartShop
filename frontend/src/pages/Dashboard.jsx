import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-badge">SmartShop</span>
          <h2>Dashboard</h2>
          <p>You are signed in and ready to shop.</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link to="/home">Go to Home</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/admin">Admin Panel</Link>
          </div>
        </div>
      </section>
    </main>
  );
}