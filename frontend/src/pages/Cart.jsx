import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Cart.css";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(res.data || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "We could not load your cart right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const formatPrice = (value) => {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return "Rs 0";
    }

    return `Rs ${numericValue.toLocaleString()}`;
  };

  const totalPrice = useMemo(() => {
    return (cart?.items || []).reduce((sum, item) => {
      const price = Number(item?.product?.price || 0);
      const quantity = Number(item?.quantity || 1);

      return sum + price * quantity;
    }, 0);
  }, [cart]);

  const removeFromCart = async (productId) => {
    try {
      await API.delete("/cart/remove", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { productId },
      });

      await fetchCart();
    } catch (err) {
      setError(
        err.response?.data?.message || "We could not remove this item right now."
      );
    }
  };

  return (
    <main className="cart-shell">
      <section className="cart-hero">
        <div>
          <span className="cart-badge">SmartShop</span>
          <h1>Your Cart</h1>
          <p>Review items before checkout and keep your shopping flow smooth.</p>
        </div>

        <Link className="cart-link" to="/home">
          Continue shopping
        </Link>
      </section>

      {loading ? <p className="cart-message">Loading cart...</p> : null}
      {error ? <p className="cart-message cart-message--error">{error}</p> : null}

      {!loading && !error ? (
        <section className="cart-panel">
          {!cart?.items?.length ? (
            <p className="cart-message">Your cart is empty.</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map((item) => {
                  const product = item.product;

                  if (!product) {
                    return null;
                  }

                  return (
                  <article key={product._id} className="cart-item">
                    <img
                      src={
                        product.image ||
                        "https://via.placeholder.com/120x120?text=Product"
                      }
                      alt={product.title}
                      className="cart-item-image"
                    />

                    <div className="cart-item-content">
                      <h3>{product.title}</h3>
                      <p>{formatPrice(product.price)}</p>
                      <span>Qty: {item.quantity}</span>
                    </div>

                    <button
                      className="cart-remove"
                      type="button"
                      onClick={() => removeFromCart(product._id)}
                    >
                      Remove
                    </button>
                  </article>
                  );
                })}
              </div>

              <footer className="cart-total">
                <div>
                  <span>Total</span>
                  <strong>{formatPrice(totalPrice)}</strong>
                </div>
                <button className="cart-checkout" type="button">
                  Purchase
                </button>
              </footer>
            </>
          )}
        </section>
      ) : null}
    </main>
  );
}