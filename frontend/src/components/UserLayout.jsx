import { Navigate, Outlet } from "react-router-dom";
import UserNavbar from "./UserNavbar";

export default function UserLayout() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (user?.role === "admin") {
    return <Navigate to="/admin" />;
  }

  return (
    <div>
      <UserNavbar />
      <main className="user-layout-content">
        <Outlet />
      </main>
    </div>
  );
}
