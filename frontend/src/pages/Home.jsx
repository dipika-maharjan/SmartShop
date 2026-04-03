import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await API.get("/products");
        setProducts(res.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "We could not load products right now. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (value) => {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return "Rs 0";
    }

    return `Rs ${numericValue.toLocaleString()}`;
  };

  return (
    <main className="shop-shell">
      <header className="shop-hero">
        <div>
          <span className="shop-badge">SmartShop</span>
          <h1>Discover Everyday Essentials</h1>
          <p>Fresh picks, trusted quality, and smooth checkout in one place.</p>
        </div>

        <div className="shop-actions">
          <Link className="shop-link" to={token ? "/dashboard" : "/"}>
            {token ? "Go to dashboard" : "Login"}
          </Link>
          {!token ? (
            <Link className="shop-link shop-link--secondary" to="/register">
              Create account
            </Link>
          ) : null}
        </div>
      </header>

      {loading ? <p className="shop-message">Loading products...</p> : null}
      {error ? <p className="shop-message shop-message--error">{error}</p> : null}

      {!loading && !error ? (
        <section className="product-grid">
          {products.length === 0 ? (
            <p className="shop-message">No products available yet.</p>
          ) : (
            products.map((p) => (
              <article key={p._id} className="product-card">
                <div className="product-image-wrap">
                  <img
                    src={p.image || "https://via.placeholder.com/480x320?text=Product"}
                    alt={p.title}
                    className="product-image"
                  />
                </div>

                <div className="product-content">
                  <h3>{p.title}</h3>
                  <p className="product-category">{p.category || "General"}</p>
                  <p className="product-price">{formatPrice(p.price)}</p>

                  {token ? (
                    <button className="product-btn" type="button">
                      Add to Cart
                    </button>
                  ) : (
                    <Link className="product-btn product-btn--ghost" to="/">
                      Login to purchase
                    </Link>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      ) : null}
    </main>
  );
}