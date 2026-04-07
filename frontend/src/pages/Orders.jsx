import { useEffect, useState } from "react";
import API from "../services/api";
import "./Orders.css";

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
      <main className="orders-shell">
        <section className="orders-card">
          <h2>My Orders</h2>
          <p>Loading your orders...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-shell">
      <section className="orders-card">
        <header className="orders-head">
          <span className="orders-badge">Purchases</span>
          <h2>My Orders</h2>
          <p>Track all your completed payments and item summaries.</p>
        </header>

        {error && <p className="orders-error">{error}</p>}

        {!error && orders.length === 0 && <p className="orders-empty">You have no orders yet.</p>}

        {orders.map((order) => (
          <article key={order._id} className="orders-item-card">
            <div className="orders-item-head">
              <h3>Order ID: {order._id}</h3>
              <strong>Rs {Number(order.totalAmount || 0).toLocaleString()}</strong>
            </div>
            <p className="orders-item-date">
              {order?.createdAt ? new Date(order.createdAt).toLocaleString() : "Date unavailable"}
            </p>

            <div className="orders-item-list">
              {(order.items || []).map((item, index) => (
                <p key={`${order._id}-${item?.product?._id || index}`}>
                  {item?.product?.title || "Product removed"} (x{item.quantity})
                </p>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
