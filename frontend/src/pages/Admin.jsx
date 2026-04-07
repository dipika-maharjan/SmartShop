import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [product, setProduct] = useState({
    title: "",
    price: "",
    image: "",
    stock: "",
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderAmount: "",
    expiresAt: "",
  });
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingStock, setEditingStock] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setError("");
      const res = await API.get("/products", {
        ...authHeaders,
        params: { page: 1, limit: 50 },
      });

      const data = res.data;
      const productItems = Array.isArray(data) ? data : data?.items || [];
      setProducts(productItems);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setError("");
      const res = await API.get("/orders", authHeaders);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await API.get("/coupons", authHeaders);
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch coupons.");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    try {
      setError("");
      setSuccess("");

      if (!product.title.trim() || !product.price || !product.image.trim()) {
        setError("Please fill title, price, and image URL.");
        return;
      }

      setSubmitting(true);
      await API.post(
        "/products",
        {
          ...product,
          price: Number(product.price),
          stock: Number(product.stock || 0),
        },
        authHeaders
      );

      setProduct({ title: "", price: "", image: "", stock: "" });
  setImagePreview("");
      await fetchProducts();
      setSuccess("Product added successfully.");
      setActiveSection("manage-products");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    const maxFileSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      setError("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setProduct((prev) => ({ ...prev, image: result }));
      setImagePreview(result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteProduct = async (id) => {
    try {
      setError("");
      setSuccess("");
      await API.delete(`/products/${id}`, authHeaders);
      await fetchProducts();
      setSuccess("Product deleted.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleUpdateStock = async (id) => {
    try {
      setError("");
      setSuccess("");
      const stock = Number(editingStock[id]);

      if (!Number.isFinite(stock) || stock < 0) {
        setError("Stock must be a non-negative number.");
        return;
      }

      await API.put(`/products/${id}`, { stock }, authHeaders);
      await fetchProducts();
      setSuccess("Stock updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update stock.");
    }
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order?.totalAmount || 0),
    0
  );

  const lowStockCount = products.filter((p) => Number(p.stock || 0) <= 5).length;

  const renderDashboard = () => (
    <section className="admin-panel-section">
      <h3>Admin Dashboard</h3>
      <p className="admin-section-muted">
        Quick summary of platform activity and inventory.
      </p>

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p>Total Products</p>
          <strong>{products.length}</strong>
        </article>
        <article className="admin-stat-card">
          <p>Total Orders</p>
          <strong>{orders.length}</strong>
        </article>
        <article className="admin-stat-card">
          <p>Low Stock Items</p>
          <strong>{lowStockCount}</strong>
        </article>
        <article className="admin-stat-card">
          <p>Total Revenue</p>
          <strong>Rs {totalRevenue.toLocaleString()}</strong>
        </article>
      </div>
    </section>
  );

  const renderAddProduct = () => (
    <section className="admin-panel-section">
      <h3>Add Product</h3>
      <p className="admin-section-muted">
        Create new catalog items with stock and product details.
      </p>

      <div className="admin-form-grid">
        <label>
          Title
          <input
            placeholder="Title"
            value={product.title}
            onChange={(e) => setProduct({ ...product, title: e.target.value })}
          />
        </label>
        <label>
          Price
          <input
            placeholder="Price"
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
          />
        </label>
        <label>
          Image URL (optional if you upload)
          <input
            placeholder="Image URL"
            value={product.image}
            onChange={(e) => setProduct({ ...product, image: e.target.value })}
          />
        </label>
        <label>
          Choose an image
          <input type="file" accept="image/*" onChange={handleImageFileChange} />
        </label>
        <label>
          Stock
          <input
            placeholder="Stock"
            type="number"
            value={product.stock}
            onChange={(e) => setProduct({ ...product, stock: e.target.value })}
          />
        </label>
      </div>

      {imagePreview ? (
        <div className="admin-image-preview-wrap">
          <img src={imagePreview} alt="Selected preview" className="admin-image-preview" />
        </div>
      ) : null}

      <button
        className="admin-primary-btn"
        onClick={handleCreate}
        disabled={submitting}
      >
        {submitting ? "Adding..." : "Add Product"}
      </button>
    </section>
  );

  const renderManageProducts = () => (
    <section className="admin-panel-section">
      <h3>Manage Products</h3>
      <p className="admin-section-muted">
        Update stock and remove products from the catalog.
      </p>

      {loadingProducts && <p className="admin-info">Loading products...</p>}
      {!loadingProducts && products.length === 0 && (
        <p className="admin-info">No products found.</p>
      )}

      <div className="admin-list">
        {!loadingProducts &&
          products.map((p) => (
            <article key={p._id} className="admin-list-item">
              <div className="admin-list-item-head">
                <h4>{p.title}</h4>
                <span>Rs {p.price}</span>
              </div>
              <p>Current stock: {Number(p.stock || 0)}</p>
              <div className="admin-item-actions">
                <input
                  type="number"
                  placeholder="New stock"
                  value={editingStock[p._id] ?? ""}
                  onChange={(e) =>
                    setEditingStock((prev) => ({
                      ...prev,
                      [p._id]: e.target.value,
                    }))
                  }
                />
                <button type="button" onClick={() => handleUpdateStock(p._id)}>
                  Update Stock
                </button>
                <button
                  type="button"
                  className="admin-danger-btn"
                  onClick={() => handleDeleteProduct(p._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
      </div>
    </section>
  );

  const renderAllOrders = () => (
    <section className="admin-panel-section">
      <h3>All Orders</h3>
      <p className="admin-section-muted">
        Track customer orders and purchased items.
      </p>

      {loadingOrders && <p className="admin-info">Loading orders...</p>}
      {!loadingOrders && orders.length === 0 && (
        <p className="admin-info">No orders found.</p>
      )}

      <div className="admin-list">
        {!loadingOrders &&
          orders.map((order) => (
            <article key={order._id} className="admin-list-item">
              <div className="admin-list-item-head">
                <h4>Order #{order._id}</h4>
                <span>Rs {order.totalAmount}</span>
              </div>
              <p>
                User: {order?.user?.name || "N/A"} ({order?.user?.email || "N/A"})
              </p>
              <div className="admin-order-items">
                {(order.items || []).map((item, idx) => (
                  <p key={`${order._id}-${item?.product?._id || idx}`}>
                    {item?.product?.title || "Product removed"} (x{item.quantity})
                  </p>
                ))}
              </div>
            </article>
          ))}
      </div>
    </section>
  );

  const handleCreateCoupon = async () => {
    try {
      setError("");
      setSuccess("");

      if (!couponForm.code.trim() || !couponForm.discountValue) {
        setError("Coupon code and discount value are required.");
        return;
      }

      await API.post(
        "/coupons",
        {
          code: couponForm.code.trim().toUpperCase(),
          discountType: couponForm.discountType,
          discountValue: Number(couponForm.discountValue),
          minOrderAmount: Number(couponForm.minOrderAmount || 0),
          expiresAt: couponForm.expiresAt || undefined,
        },
        authHeaders
      );

      setCouponForm({
        code: "",
        discountType: "percent",
        discountValue: "",
        minOrderAmount: "",
        expiresAt: "",
      });

      await fetchCoupons();
      setSuccess("Coupon created.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create coupon.");
    }
  };

  const renderCoupons = () => (
    <section className="admin-panel-section">
      <h3>Coupons</h3>
      <p className="admin-section-muted">
        Create and review discount coupons used at checkout.
      </p>

      <div className="admin-form-grid">
        <label>
          Code
          <input
            value={couponForm.code}
            onChange={(e) => setCouponForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="SAVE10"
          />
        </label>
        <label>
          Discount Type
          <select
            value={couponForm.discountType}
            onChange={(e) => setCouponForm((prev) => ({ ...prev, discountType: e.target.value }))}
          >
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select>
        </label>
        <label>
          Discount Value
          <input
            type="number"
            value={couponForm.discountValue}
            onChange={(e) => setCouponForm((prev) => ({ ...prev, discountValue: e.target.value }))}
            placeholder="10"
          />
        </label>
        <label>
          Min Order Amount
          <input
            type="number"
            value={couponForm.minOrderAmount}
            onChange={(e) => setCouponForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
            placeholder="1000"
          />
        </label>
        <label>
          Expiry (optional)
          <input
            type="datetime-local"
            value={couponForm.expiresAt}
            onChange={(e) => setCouponForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
          />
        </label>
      </div>

      <button className="admin-primary-btn" type="button" onClick={handleCreateCoupon}>
        Create Coupon
      </button>

      <div className="admin-list">
        {coupons.map((coupon) => (
          <article key={coupon._id} className="admin-list-item">
            <div className="admin-list-item-head">
              <h4>{coupon.code}</h4>
              <span>{coupon.discountType === "percent" ? `${coupon.discountValue}%` : `Rs ${coupon.discountValue}`}</span>
            </div>
            <p>
              Min order: Rs {coupon.minOrderAmount || 0} | Active: {coupon.isActive ? "Yes" : "No"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );

  const renderActiveSection = () => {
    if (activeSection === "add-product") {
      return renderAddProduct();
    }

    if (activeSection === "manage-products") {
      return renderManageProducts();
    }

    if (activeSection === "all-orders") {
      return renderAllOrders();
    }

    if (activeSection === "coupons") {
      return renderCoupons();
    }

    return renderDashboard();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <main className="admin-shell">
      <section className="admin-dashboard-card">
        <div className="admin-dashboard-head">
          <div className="admin-dashboard-head-top">
            <span className="auth-badge auth-badge--alt">Admin</span>
            <button type="button" className="admin-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <h2>Admin Dashboard</h2>
          <p>Manage products, monitor stock, and review all customer orders.</p>
        </div>

        <div className="admin-grid">
          <aside className="admin-sidebar">
            <button
              className={activeSection === "dashboard" ? "active" : ""}
              onClick={() => setActiveSection("dashboard")}
              type="button"
            >
              Dashboard
            </button>
            <button
              className={activeSection === "add-product" ? "active" : ""}
              onClick={() => setActiveSection("add-product")}
              type="button"
            >
              Add Product
            </button>
            <button
              className={activeSection === "manage-products" ? "active" : ""}
              onClick={() => setActiveSection("manage-products")}
              type="button"
            >
              Manage Products
            </button>
            <button
              className={activeSection === "all-orders" ? "active" : ""}
              onClick={() => setActiveSection("all-orders")}
              type="button"
            >
              All Orders
            </button>
            <button
              className={activeSection === "coupons" ? "active" : ""}
              onClick={() => setActiveSection("coupons")}
              type="button"
            >
              Coupons
            </button>
          </aside>

          <div className="admin-content">
            {error ? <p className="admin-error">{error}</p> : null}
            {success ? <p className="admin-success">{success}</p> : null}
            {renderActiveSection()}
          </div>
        </div>
      </section>
    </main>
  );
}
