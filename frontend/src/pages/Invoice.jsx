import { useMemo } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import "./Invoice.css";

export default function Invoice() {
  const location = useLocation();
  const stateOrder = location.state?.order;
  const statePayment = location.state?.paymentDetails;

  const fallbackOrder = JSON.parse(localStorage.getItem("lastOrder") || "null");
  const fallbackPayment = JSON.parse(localStorage.getItem("lastPaymentDetails") || "null");

  const order = stateOrder || fallbackOrder;
  const paymentDetails = statePayment || fallbackPayment;

  const formattedDate = useMemo(() => {
    const raw = order?.createdAt || new Date().toISOString();
    return new Date(raw).toLocaleString();
  }, [order]);

  const formatPrice = (value) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return "Rs 0";
    }

    return `Rs ${numericValue.toLocaleString()}`;
  };

  if (!order) {
    return <Navigate to="/orders" />;
  }

  const items = order?.items || [];

  return (
    <main className="invoice-shell">
      <section className="invoice-card">
        <header className="invoice-head">
          <div>
            <span className="invoice-badge">Payment Receipt</span>
            <h1>SmartShop Invoice</h1>
            <p>Thank you for your purchase. Your payment is confirmed.</p>
          </div>

          <button type="button" className="invoice-print-btn" onClick={() => window.print()}>
            Print Bill
          </button>
        </header>

        <div className="invoice-meta-grid">
          <article>
            <h3>Bill Type</h3>
            <p>Retail Invoice</p>
          </article>
          <article>
            <h3>Order ID</h3>
            <p>{order._id}</p>
          </article>
          <article>
            <h3>Date</h3>
            <p>{formattedDate}</p>
          </article>
          <article>
            <h3>Payment Type</h3>
            <p>{paymentDetails?.paymentType || "Card (Stripe)"}</p>
          </article>
          <article>
            <h3>Payment Status</h3>
            <p className="invoice-status">{order.paymentStatus || "paid"}</p>
          </article>
          <article>
            <h3>Payment Reference</h3>
            <p>{order.paymentIntentId || paymentDetails?.paymentIntentId || "N/A"}</p>
          </article>
        </div>

        <section className="invoice-items">
          <div className="invoice-items-head">
            <span>Item</span>
            <span>Qty</span>
            <span>Total</span>
          </div>

          {items.map((item, index) => {
            const title = item?.product?.title || "Product";
            const quantity = Number(item?.quantity || 1);
            const price = Number(item?.product?.price || 0);
            const lineTotal = quantity * price;

            return (
              <div key={`${title}-${index}`} className="invoice-item-row">
                <span>{title}</span>
                <span>{quantity}</span>
                <span>{formatPrice(lineTotal)}</span>
              </div>
            );
          })}
        </section>

        <footer className="invoice-total">
          <span>Grand Total</span>
          <strong>{formatPrice(order.totalAmount)}</strong>
        </footer>

        <div className="invoice-actions">
          <Link to="/orders" className="invoice-link invoice-link--secondary">
            View My Orders
          </Link>
          <Link to="/home" className="invoice-link">
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
