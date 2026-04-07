import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const authHeaders = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [productsRes, ordersRes, wishlistRes] = await Promise.all([
          API.get("/products", { params: { page: 1, limit: 24, sort: "newest" } }),
          API.get("/orders/my", authHeaders),
          API.get("/wishlist", authHeaders),
        ]);

        const productData = productsRes.data;
        setProducts(Array.isArray(productData) ? productData : productData?.items || []);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setWishlist(wishlistRes.data || { items: [] });
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load personalized dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const preferredCategories = useMemo(() => {
    const categories = new Set();

    (orders || []).forEach((order) => {
      (order.items || []).forEach((item) => {
        const category = item?.product?.category;
        if (category) {
          categories.add(category);
        }
      });
    });

    (wishlist?.items || []).forEach((item) => {
      const category = item?.product?.category;
      if (category) {
        categories.add(category);
      }
    });

    return categories;
  }, [orders, wishlist]);

  const personalizedProducts = useMemo(() => {
    const selected = products.filter((product) =>
      preferredCategories.has(product?.category)
    );

    if (selected.length) {
      return selected.slice(0, 8);
    }

    return products.slice(0, 8);
  }, [products, preferredCategories]);

  const newestProducts = useMemo(() => products.slice(0, 6), [products]);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero section-card">
        <span className="auth-badge">SmartShop</span>
        <h2>Welcome Back</h2>
        <p>
          Explore personalized picks based on your activity and discover fresh arrivals.
        </p>

        <div className="dashboard-quick-actions">
          <Link to="/home">Browse All Products</Link>
          <Link to="/wishlist">Open Wishlist</Link>
          <Link to="/orders">Track Orders</Link>
        </div>
      </section>

      {loading ? <p className="dashboard-info">Loading personalized feed...</p> : null}
      {error ? <p className="dashboard-info dashboard-info--error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <section className="section-card dashboard-section">
            <div className="dashboard-section-head">
              <h3>Recommended For You</h3>
              <p>
                {preferredCategories.size
                  ? "Based on your orders and wishlist"
                  : "Popular picks to get you started"}
              </p>
            </div>

            <div className="dashboard-grid">
              {personalizedProducts.map((product) => (
                <article key={product._id} className="dashboard-product-card">
                  <img
                    src={product.image || "https://via.placeholder.com/360x240?text=Product"}
                    alt={product.title}
                  />
                  <div>
                    <h4>{product.title}</h4>
                    <p>{product.category || "General"}</p>
                    <strong>Rs {Number(product.price || 0).toLocaleString()}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section-card dashboard-section">
            <div className="dashboard-section-head">
              <h3>New Arrivals</h3>
              <p>Recently added products in the catalog</p>
            </div>

            <div className="dashboard-grid dashboard-grid--compact">
              {newestProducts.map((product) => (
                <article key={product._id} className="dashboard-product-card dashboard-product-card--compact">
                  <img
                    src={product.image || "https://via.placeholder.com/320x220?text=Product"}
                    alt={product.title}
                  />
                  <div>
                    <h4>{product.title}</h4>
                    <strong>Rs {Number(product.price || 0).toLocaleString()}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}