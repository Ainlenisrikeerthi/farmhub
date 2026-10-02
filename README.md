# 🌾 FarmHub — Python Django + React + Supabase Full Stack

FarmHub is a farm-to-doorstep e-commerce platform for fresh produce and organic products.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite (deployed on **Netlify**) |
| **Backend** | Python Django + Django REST Framework (deployed on **Render**) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Custom JWT (PyJWT) |
| **Payments** | Razorpay |
| **Email** | SMTP (Gmail) |

---

## Project Structure

```
farmhub/
├── farmhub-frontend/       # React Vite app (Netlify)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── netlify.toml
│   └── .env.example
│
└── farmhub-backend/        # Django REST API (Render)
    ├── farmhub/            # Django project settings
    ├── api/                # Main app (models, views, serializers)
    │   ├── migrations/
    │   └── management/
    ├── build.sh            # Render build script
    ├── Procfile
    ├── requirements.txt
    ├── render.yaml
    └── .env.example
```

---

## Backend Setup (Local)

```bash
cd farmhub-backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env and set DATABASE_URL (Supabase) and other variables

# Run migrations
python manage.py migrate

# Seed initial data (categories, products, admin user)
python manage.py seed_data

# Start development server
python manage.py runserver
```

**Default credentials (seeded):**
- Admin: `admin@farmhub.com` / `admin123`
- Demo User: `user@farmhub.com` / `user123`

---

## Frontend Setup (Local)

```bash
cd farmhub-frontend

npm install

# Create .env from example
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000/api

npm run dev
```

---

## Environment Variables

### Backend (`farmhub-backend/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection URL |
| `SECRET_KEY` | Django secret key |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `FRONTEND_URL` | Frontend URL (for email links) |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `EMAIL_HOST_USER` | Gmail address |
| `EMAIL_HOST_PASSWORD` | Gmail app password |

### Frontend (`farmhub-frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g., `https://yourapp.onrender.com/api`) |

---

## Deployment

### Backend → Render
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory**: `farmhub-backend`
4. Set **Build Command**: `./build.sh`
5. Set **Start Command**: `gunicorn farmhub.wsgi:application`
6. Add environment variables (DATABASE_URL, JWT_SECRET, FRONTEND_URL, etc.)

### Frontend → Netlify
1. Create a new **Site** on [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set **Base Directory**: `farmhub-frontend`
4. Set **Build Command**: `npm run build`
5. Set **Publish Directory**: `dist`
6. Add environment variable: `VITE_API_URL` = your Render backend URL + `/api`

---

## Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database**
3. Copy the **Connection String (URI)** (use the **pooled** version for production)
4. Add it as `DATABASE_URL` in your Render environment variables
5. Django migrations will auto-create all tables via `build.sh`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/verify-email` | Public | Verify email |
| GET | `/api/products` | Public | List products |
| GET | `/api/products/page` | Public | Paginated products |
| GET | `/api/categories` | Public | List categories |
| GET | `/api/reviews/product/:id` | Public | Product reviews |
| POST | `/api/orders` | Authenticated | Create order |
| GET | `/api/orders/my` | Authenticated | My orders |
| GET | `/api/orders/admin/all` | Admin | All orders |
| PUT | `/api/orders/admin/:id/status` | Admin | Update status |
| POST | `/api/payments/create-order` | Authenticated | Razorpay order |
| POST | `/api/payments/verify` | Authenticated | Verify payment |

---

## Features
- 🔐 JWT Authentication (register, login, email verification, forgot/reset password)
- 🛒 Product catalog with pagination, search, and filtering by category
- 📦 Order management (COD + Razorpay online payment)
- 🚜 Dual delivery: Farm Delivery (10km GPS radius) + Courier
- ⭐ Product reviews & ratings
- 👑 Admin dashboard (products, categories, orders)
- 🗺️ Geolocation distance calculation from farm
- 📧 Email notifications (optional via Gmail SMTP)
