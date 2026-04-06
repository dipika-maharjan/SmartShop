import { useEffect, useState } from "react";
import API from "../services/api";

export default function Admin() {
  const [product, setProduct] = useState({
    title: "",
    price: "",
    image: "",
  });
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await API.get("/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreate = async () => {
    try {
      setError("");

      if (!product.title.trim() || !product.price || !product.image.trim()) {
        setError("Please fill title, price, and image URL.");
        return;
      }

      setSubmitting(true);
      await API.post("/products", {
        ...product,
        price: Number(product.price),
      });

      setProduct({ title: "", price: "", image: "" });
      alert("Product added");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card" style={{ maxWidth: "900px" }}>
        <h2>Admin Panel</h2>

        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        <div
          style={{
            display: "grid",
            gap: "10px",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <input
            placeholder="Title"
            value={product.title}
            onChange={(e) =>
              setProduct({ ...product, title: e.target.value })
            }
          />
          <input
            placeholder="Price"
            type="number"
            value={product.price}
            onChange={(e) =>
              setProduct({ ...product, price: e.target.value })
            }
          />
          <input
            placeholder="Image URL"
            value={product.image}
            onChange={(e) =>
              setProduct({ ...product, image: e.target.value })
            }
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={submitting}
          style={{ marginTop: "12px" }}
        >
          {submitting ? "Adding..." : "Add Product"}
        </button>

        <hr style={{ margin: "20px 0" }} />

        <h3>All Orders</h3>

        {loadingOrders && <p>Loading orders...</p>}

        {!loadingOrders && orders.length === 0 && <p>No orders found.</p>}

        {!loadingOrders &&
          orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "12px",
                marginTop: "12px",
              }}
            >
              <p style={{ margin: "0 0 8px" }}>
                <strong>Order:</strong> {order._id}
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong>User:</strong> {order?.user?.name || "N/A"} ({order?.user?.email || "N/A"})
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong>Total:</strong> Rs {order.totalAmount}
              </p>
              {(order.items || []).map((item, idx) => (
                <p key={`${order._id}-${item?.product?._id || idx}`} style={{ margin: 0 }}>
                  {item?.product?.title || "Product removed"} (x{item.quantity})
                </p>
              ))}
            </div>
          ))}
      </section>
    </div>
  );
}
