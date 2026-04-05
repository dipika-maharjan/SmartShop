import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Checkout.css";

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchCart();
  }, []);

  const formatPrice = (value) => {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return "Rs 0";
    }

    return `Rs ${numericValue.toLocaleString()}`;
  };

  const totalAmount = (cart?.items || []).reduce((sum, item) => {
    const price = Number(item?.product?.price || 0);
    const quantity = Number(item?.quantity || 1);

    return sum + price * quantity;
  }, 0);

  const handlePayment = async () => {
    if (!totalAmount || totalAmount <= 0) {
      setError("Cart is empty or has no valid amount.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      await API.post(
        "/orders",
        { amount: totalAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Payment successful & order placed");
      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.message || "Payment failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="checkout-shell">
        <p className="checkout-message">Loading checkout...</p>
      </main>
    );
  }

  return (
    <main className="checkout-shell">
      <section className="checkout-hero">
        <div>
          <span className="checkout-badge">SmartShop</span>
          <h1>Checkout</h1>
          <p>Review your order and complete your purchase securely.</p>
        </div>
      </section>

      {error ? <p className="checkout-message checkout-message--error">{error}</p> : null}

      {!cart?.items?.length ? (
        <section className="checkout-panel">
          <p className="checkout-message">Your cart is empty.</p>
        </section>
      ) : (
        <section className="checkout-panel">
          <div className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-items">
              {cart.items.map((item) => {
                const product = item.product;

                if (!product) {
                  return null;
                }

                const itemTotal = Number(product.price || 0) * Number(item.quantity || 1);

                return (
                  <div key={product._id} className="checkout-row">
                    <div>
                      <p className="checkout-item-name">{product.title}</p>
                      <p className="checkout-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="checkout-item-price">{formatPrice(itemTotal)}</p>
                  </div>
                );
              })}
            </div>

            <div className="checkout-divider"></div>

            <div className="checkout-total">
              <span>Total Amount</span>
              <strong>{formatPrice(totalAmount)}</strong>
            </div>
          </div>

          <div className="checkout-actions">
            <button
              className="checkout-btn"
              type="button"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? "Processing..." : "Complete Payment"}
            </button>
            <p className="checkout-info">
              This is a simulated payment for demo purposes.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
