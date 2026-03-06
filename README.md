# 🛒 Digital Store — Complete Setup & Deployment Guide

> **Tech Stack**: Next.js 14 · Neon PostgreSQL · Cloudinary · Razorpay · Nodemailer · CallMeBot WhatsApp · Facebook Pixel · Vercel

---

## 📋 STEP 1: Accounts Setup Karo

### 1. Neon Database (Free)
1. https://neon.tech par signup karo
2. New project banao
3. **Connection string** copy karo — yahi `DATABASE_URL` hogi

### 2. Cloudinary (Free)
1. https://cloudinary.com signup karo
2. Dashboard mein jao → API Keys
3. `Cloud Name`, `API Key`, `API Secret` copy karo

### 3. Razorpay
1. https://razorpay.com → Dashboard → Settings → API Keys
2. `Key ID` aur `Key Secret` copy karo
3. Live mode ke liye KYC complete karo (test ke liye test keys use karo)

### 4. Gmail App Password (Email ke liye)
1. Gmail → Account Settings → Security → 2-Step Verification ON karo
2. App Passwords → Generate new → Copy karo
3. Yahi `EMAIL_PASS` hoga

### 5. CallMeBot WhatsApp (Free — No Twilio needed)
1. Apne WhatsApp se **+34 644 60 16 99** pe message karo:
   `I allow callmebot to send me messages`
2. Wait karo, confirmation aayega API key ke saath
3. Woh key `CALLMEBOT_API_KEY` mein daalo

### 6. Facebook Pixel
1. https://business.facebook.com → Events Manager → Create Pixel
2. Pixel ID copy karo

---

## 📋 STEP 2: GitHub Repo Banao

```bash
# Repo create karo GitHub pe aur yeh commands run karo:
git init
git add .
git commit -m "Initial commit - Digital Store"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 📋 STEP 3: Vercel Deploy

1. https://vercel.com → "Add New Project"
2. GitHub repo select karo
3. **Environment Variables** add karo (sab niche diye hain):

```env
DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123xyz
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM_NAME=My Digital Store
CALLMEBOT_API_KEY=your_callmebot_key
ADMIN_WHATSAPP=919876543210
NEXT_PUBLIC_FB_PIXEL_ID=1234567890123456
ADMIN_JWT_SECRET=generate_random_64_char_string_here_abcdef1234567890xyz
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
NEXT_PUBLIC_STORE_NAME=My Digital Store
NEXT_PUBLIC_STORE_TAGLINE=Premium Digital Products
```

4. **Deploy** button dabao ✅

---

## 📋 STEP 4: Database Initialize Karo

Deploy hone ke baad ek baar yeh URL visit karo:
```
https://your-project.vercel.app/api/init
```
Yeh tables banayega aur default admin account setup karega.

---

## 📋 STEP 5: Admin Panel

Admin panel ka URL:
```
https://your-project.vercel.app/admin/login
```

**Default credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Pehle login ke baad password zaroor change karo!

---

## 🔑 JWT Secret Generate Karna

Ek random secure string generate karo:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📱 Features Summary

### Customer Features:
- ✅ Homepage with all products (dark premium UI)
- ✅ Product pages with shareable links
- ✅ Copy link + WhatsApp/Facebook share
- ✅ Checkout with only 3 fields (Name, Email, WhatsApp)
- ✅ Razorpay payment modal
- ✅ Instant email + WhatsApp delivery after payment

### Admin Features:
- ✅ Secure login (no OAuth, just username/password)
- ✅ Dashboard with stats
- ✅ Add product with image upload from device (Cloudinary)
- ✅ Edit / Delete products
- ✅ Toggle product visibility
- ✅ Share product link per product
- ✅ Leads page with buyer details + CSV export
- ✅ Revenue page with product-wise breakdown

### Technical:
- ✅ Facebook Pixel (PageView, ViewContent, InitiateCheckout, Purchase)
- ✅ Neon PostgreSQL database
- ✅ Cloudinary for images
- ✅ Razorpay payment verification (HMAC SHA256)
- ✅ Auto email via Gmail SMTP
- ✅ Auto WhatsApp via CallMeBot (free)
- ✅ Vercel deployment ready

---

## 🛠️ Local Development

```bash
npm install
# .env.local file banao aur sab env vars daalo
npm run dev
# http://localhost:3000
```

---

## ❓ Support

Koi issue aaye to Vercel logs check karo:
Vercel Dashboard → Your Project → Functions → Logs
