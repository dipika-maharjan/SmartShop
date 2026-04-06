import { useEffect, useState } from "react";
import API from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError("");
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view your orders.");
          return;
        }

        const res = await API.get("/orders/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <h2>My Orders</h2>
          <p>Loading your orders...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <section className="auth-card" style={{ maxWidth: "800px" }}>
        <h2>My Orders</h2>

        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {!error && orders.length === 0 && <p>You have no orders yet.</p>}

        {orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "12px",
              marginTop: "12px",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Order ID: {order._id}</h3>
            <p style={{ margin: "0 0 8px" }}>Total: Rs {order.totalAmount}</p>

            {(order.items || []).map((item, index) => (
              <div key={`${order._id}-${item?.product?._id || index}`}>
                <p style={{ margin: "0 0 6px" }}>
                  {item?.product?.title || "Product removed"} (x{item.quantity})
                </p>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
