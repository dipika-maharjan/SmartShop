import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 12,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          limit: 9,
          sort: filters.sort,
        };

        if (filters.q.trim()) {
          params.q = filters.q.trim();
        }
        if (filters.category.trim()) {
          params.category = filters.category.trim();
        }
        if (filters.minPrice.trim()) {
          params.minPrice = filters.minPrice.trim();
        }
        if (filters.maxPrice.trim()) {
          params.maxPrice = filters.maxPrice.trim();
        }

        const res = await API.get("/products", { params });
        const data = res.data;

        if (Array.isArray(data)) {
          setProducts(data);
          setPagination({ total: data.length, page: 1, pages: 1, limit: data.length || 9 });
        } else {
          setProducts(data?.items || []);
          setPagination(
            data?.pagination || { total: 0, page: 1, pages: 1, limit: 9 }
          );
        }
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
  }, [filters, page]);

  const formatPrice = (value) => {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return "Rs 0";
    }

    return `Rs ${numericValue.toLocaleString()}`;
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      return;
    }

    try {
      await API.post(
        "/cart/add",
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Added to cart");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not add this item to cart right now."
      );
    }
  };

  const onFilterChange = (field, value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({
      q: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    });
  };

  const handleAddToWishlist = async (productId) => {
    if (!token) {
      return;
    }

    try {
      await API.post(
        "/wishlist",
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Added to wishlist");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not add this item to wishlist right now."
      );
    }
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
          {token ? (
            <Link className="shop-link shop-link--secondary" to="/cart">
              View cart
            </Link>
          ) : null}
          {token ? (
            <Link className="shop-link shop-link--secondary" to="/wishlist">
              Wishlist
            </Link>
          ) : null}
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

      <section className="shop-filters">
        <div className="shop-filters-head">
          <h2>Find Products Faster</h2>
          <button type="button" className="shop-clear-btn" onClick={clearFilters}>
            Clear filters
          </button>
        </div>

        <div className="shop-filters-grid">
          <label className="shop-filter-field shop-filter-field--search">
            <span>Search</span>
            <input
              placeholder="Search products, category, or description"
              value={filters.q}
              onChange={(e) => onFilterChange("q", e.target.value)}
            />
          </label>

          <label className="shop-filter-field">
            <span>Category</span>
            <input
              placeholder="e.g. Electronics"
              value={filters.category}
              onChange={(e) => onFilterChange("category", e.target.value)}
            />
          </label>

          <label className="shop-filter-field">
            <span>Min Price</span>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => onFilterChange("minPrice", e.target.value)}
            />
          </label>

          <label className="shop-filter-field">
            <span>Max Price</span>
            <input
              type="number"
              placeholder="5000"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange("maxPrice", e.target.value)}
            />
          </label>

          <label className="shop-filter-field">
            <span>Sort By</span>
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange("sort", e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="nameAsc">Name: A-Z</option>
            </select>
          </label>
        </div>
      </section>

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
                  <p className="product-category">Stock: {Number(p.stock || 0)}</p>

                  {token ? (
                    <div style={{ display: "grid", gap: "8px" }}>
                      <button
                        className="product-btn"
                        type="button"
                        disabled={Number(p.stock || 0) <= 0}
                        onClick={() => handleAddToCart(p._id)}
                      >
                        {Number(p.stock || 0) <= 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                      <button
                        className="product-btn product-btn--wishlist"
                        type="button"
                        onClick={() => handleAddToWishlist(p._id)}
                      >
                        Save to Wishlist
                      </button>
                    </div>
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

      {!loading && !error && pagination.pages > 1 ? (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span style={{ alignSelf: "center" }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
            disabled={page >= pagination.pages}
          >
            Next
          </button>
        </div>
      ) : null}
    </main>
  );
}