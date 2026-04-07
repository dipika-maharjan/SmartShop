# SmartShop

SmartShop is a full-stack e-commerce platform with user/admin dashboards, Stripe card checkout, coupon support, wishlist, profile/address book, and order/invoice flow.

## Tech Stack
- Frontend: React + Vite + React Router + Stripe Elements
- Backend: Node.js + Express + MongoDB + JWT
- Payments: Stripe Payment Intents + Webhook verification
- DevOps: Docker + docker-compose + GitHub Actions CI baseline

## Implemented Features
- Email/password auth with JWT
- Role-based access (`user` / `admin`)
- Product catalog with search/filter/sort/pagination
- Cart + wishlist + profile + address book
- Coupon creation/apply flow
- Stripe card payment verification before order creation
- Invoice/receipt page after successful payment
- Admin dashboard: products, stock, orders, coupons

## Setup
### 1. Backend
1. Copy `backend/.env.example` to `backend/.env`
2. Fill required values (Mongo, JWT, Stripe)
3. Install and run:

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend
1. Copy `frontend/.env.example` to `frontend/.env`
2. Add `VITE_STRIPE_PUBLISHABLE_KEY`
3. Install and run:

```bash
cd frontend
npm install
npm run dev
```

## Stripe Local Webhook
```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```

Put the webhook secret from CLI output into `backend/.env` as `STRIPE_WEBHOOK_SECRET`.

## Test Card
- Card: `4242 4242 4242 4242`
- Exp: any future date
- CVC: any 3 digits
- ZIP: any valid value

## CI
GitHub Actions workflow is in `.github/workflows/ci.yml` and runs frontend build + backend install on push/PR.
