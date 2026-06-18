# ⚡ XTREME STORE
> Premium Free Fire ID Marketplace — Black + Neon Red Gaming Theme

---

## 🚀 Start 

### Terminal 1 — Backend
```
cd server
npm run dev
```

### Terminal 2 — Frontend
```
cd client
npm run dev
```

- Backend API: **http://localhost:5000**
- Frontend: **http://localhost:3000**

---

## ✅ Completed Features

### 🔐 Auth System
- Email + Password signup/login
- Real OTP email verification (Gmail)
- Fake/disposable email detection (200+ blocked domains)
- MX record validation
- Forgot Password (3-step: Email → OTP → New Password)
- JWT authentication
- bcrypt password hashing
- Email OTP with 10min expiry + resend with 60s cooldown

### 🎮 Marketplace
- All IDs listing with pagination
- Search by name/UID
- Filter by Category, Status, Rank, Price range
- Sort by price, level, views
- Featured & Trending sections
- ID Detail page with image/video gallery
- Add to Cart & Wishlist
- Contact buttons: WhatsApp, WhatsApp 2, Instagram, WA Channel

### ⚙️ Admin Panel
- Dashboard with stats + charts
- Add New ID with all fields
- Manage IDs (mark sold/available, delete)
- Upload images & videos (Cloudinary)
- User management with delete
- Analytics

### 🆔 ID Fields
- ID Name + Title
- UID, Level, Price, Category (auto), Rank
- Vault Collection, Evo Guns, Evo Max, Total Weapon Skins
- Rare Items (text)
- Description
- WhatsApp 1 & 2, Instagram Link, WhatsApp Channel

---


- URL: http://localhost:3000/login

---

## 📁 Structure
```
Xtreme_store/
├── server/
│   ├── controllers/     # Auth, Admin, IDs, Cart, Wishlist
│   ├── middleware/      # JWT auth
│   ├── models/          # User, ID
│   ├── routes/          # All API routes
│   ├── utils/           # Email, Token, Fake Email Validator
│   └── .env             # Config
└── client/
    └── src/
        ├── pages/       # All pages + Admin panel
        ├── components/  # Navbar, Footer, IDCard
        ├── context/     # Auth context
        └── services/    # API calls
```

---

