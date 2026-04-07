import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Wishlist.css";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlist(res.data || { items: [] });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItem = async (productId) => {
    try {
      await API.delete(`/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchWishlist();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove item.");
    }
  };

  return (
    <main className="wishlist-shell">
      <section className="wishlist-card">
        <header className="wishlist-head">
          <span className="wishlist-badge">Saved Items</span>
          <h2>My Wishlist</h2>
          <p>Save products you like and come back to them anytime.</p>
        </header>

        {loading && <p className="wishlist-info">Loading wishlist...</p>}
        {error && <p className="wishlist-error">{error}</p>}

        {!loading && !wishlist?.items?.length ? (
          <p className="wishlist-info">No wishlist items yet.</p>
        ) : null}

        {!loading &&
          (wishlist?.items || []).map((item, idx) => {
            const product = item.product;

            if (!product) {
              return null;
            }

            return (
              <article key={product._id || idx} className="wishlist-item-card">
                <div className="wishlist-item-info">
                  <img
                    src={product.image || "https://via.placeholder.com/160x120?text=Product"}
                    alt={product.title}
                  />
                  <div>
                    <p className="wishlist-item-title">{product.title}</p>
                    <p className="wishlist-item-price">Rs {Number(product.price || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="wishlist-actions">
                  <Link to="/home" className="wishlist-link">Shop</Link>
                  <button type="button" onClick={() => removeItem(product._id)} className="wishlist-remove-btn">
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
      </section>
    </main>
  );
}
