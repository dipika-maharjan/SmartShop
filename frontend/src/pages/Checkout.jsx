import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import API from "../services/api";
import "./Checkout.css";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

function CheckoutPaymentForm({ cart, totalAmount, token, navigate }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [intentLoading, setIntentLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const payableAmount = Number(couponResult?.finalAmount || totalAmount || 0);

  const initializePayment = async () => {
    setIntentLoading(true);
    setError("");

    try {
      const res = await API.post(
        "/payment/create-intent",
        {
          couponCode: couponCode.trim() || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const secret = String(res.data?.clientSecret || "");
      if (!secret) {
        throw new Error("Backend did not return payment client secret.");
      }

      setClientSecret(secret);
      if (res.data?.couponCode) {
        setCouponResult({
          code: res.data.couponCode,
          discountAmount: Number(res.data.discountAmount || 0),
          finalAmount: Number(res.data.amount || totalAmount),
        });
      }
    } catch (err) {
      setClientSecret("");
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to initialize payment."
      );
    } finally {
      setIntentLoading(false);
    }
  };

  useEffect(() => {
    if (cart?.items?.length) {
      initializePayment();
    }
  }, [cart, token]);

  const formatPrice = (value) => {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return "Rs 0";
    }

    return `Rs ${numericValue.toLocaleString()}`;
  };

  const handlePayment = async () => {
    if (!stripe || !elements) {
      setError("Stripe is still loading. Please wait.");
      return;
    }

    if (!clientSecret) {
      setError("Payment setup is incomplete. Click Retry Payment Setup.");
      return;
    }

    if (!payableAmount || payableAmount <= 0) {
      setError("Cart is empty or has no valid amount.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card input is not ready.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Payment failed. Please try again.");
        return;
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        setError("Payment could not be completed.");
        return;
      }

      const orderRes = await API.post(
        "/orders",
        {
          amount: payableAmount,
          paymentIntentId: paymentIntent.id,
          couponCode: couponCode.trim() || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const order = orderRes.data?.order;
      const paymentDetails = {
        paymentType: "Card (Stripe)",
        paymentIntentId: paymentIntent.id,
        couponCode: couponCode.trim() || undefined,
      };

      if (order) {
        localStorage.setItem("lastOrder", JSON.stringify(order));
      }
      localStorage.setItem("lastPaymentDetails", JSON.stringify(paymentDetails));

      navigate("/invoice", {
        state: {
          order,
          paymentDetails,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Payment failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Enter a coupon code first.");
      return;
    }

    setApplyingCoupon(true);
    setError("");

    try {
      const res = await API.post(
        "/coupons/apply",
        { code: couponCode.trim(), amount: totalAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCouponResult({
        code: res.data?.code,
        discountAmount: Number(res.data?.discountAmount || 0),
        finalAmount: Number(res.data?.finalAmount || totalAmount),
      });

      await initializePayment();
    } catch (err) {
      setCouponResult(null);
      setError(err.response?.data?.message || "Could not apply coupon.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  return (
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

        {couponResult ? (
          <>
            <div className="checkout-total checkout-total--subtle">
              <span>Coupon ({couponResult.code})</span>
              <strong>- {formatPrice(couponResult.discountAmount)}</strong>
            </div>
            <div className="checkout-total">
              <span>Payable Amount</span>
              <strong>{formatPrice(couponResult.finalAmount)}</strong>
            </div>
          </>
        ) : null}
      </div>

      <div className="checkout-actions">
        <div className="checkout-coupon-row">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
          />
          <button
            className="checkout-btn checkout-btn--secondary"
            type="button"
            onClick={handleApplyCoupon}
            disabled={applyingCoupon || intentLoading}
          >
            {applyingCoupon ? "Applying..." : "Apply"}
          </button>
        </div>

        <div className="checkout-card-input">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#0f172a",
                  "::placeholder": {
                    color: "#64748b",
                  },
                },
              },
            }}
          />
        </div>

        {error ? <p className="checkout-message checkout-message--error">{error}</p> : null}

        {!intentLoading && !clientSecret ? (
          <button className="checkout-btn checkout-btn--secondary" type="button" onClick={initializePayment}>
            Retry Payment Setup
          </button>
        ) : null}

        <button
          className="checkout-btn"
          type="button"
          onClick={handlePayment}
          disabled={processing || intentLoading || !stripe || !elements}
        >
          {processing ? "Processing..." : intentLoading ? "Preparing payment..." : "Pay with Card"}
        </button>
        <p className="checkout-info">Test card: 4242 4242 4242 4242, any future date, any CVC.</p>
      </div>
    </section>
  );
}

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      ) : !stripePromise ? (
        <section className="checkout-panel">
          <p className="checkout-message checkout-message--error">
            Stripe is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY in frontend .env.
          </p>
        </section>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutPaymentForm
            cart={cart}
            totalAmount={totalAmount}
            token={token}
            navigate={navigate}
          />
        </Elements>
      )}
    </main>
  );
}
