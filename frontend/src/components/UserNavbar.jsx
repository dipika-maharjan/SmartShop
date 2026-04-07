import { NavLink, useNavigate } from "react-router-dom";

export default function UserNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="user-nav-wrap">
      <nav className="user-nav">
        <div className="user-nav-brand">SmartShop</div>

        <div className="user-nav-links">
          <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>Go to Home</NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>My Orders</NavLink>
          <NavLink to="/wishlist" className={({ isActive }) => (isActive ? "active" : "")}>My Wishlist</NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>My Profile</NavLink>
        </div>

        <button type="button" onClick={handleLogout} className="user-nav-logout">
          Logout
        </button>
      </nav>
    </header>
  );
}
