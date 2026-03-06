import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default sql;

export async function initDB() {
  // ── Products table ───────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      original_price DECIMAL(10,2) NOT NULL,
      discounted_price DECIMAL(10,2) NOT NULL,
      image_url TEXT NOT NULL,
      drive_link TEXT NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Migration: add is_active column if it doesn't exist (for older tables)
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
  `;

  // Migration: set is_active = true for any products where it is NULL
  await sql`
    UPDATE products SET is_active = true WHERE is_active IS NULL
  `;

  // Migration: add updated_at if missing
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
  `;

  // ── Orders table ─────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id),
      product_name VARCHAR(255),
      buyer_name VARCHAR(255) NOT NULL,
      buyer_email VARCHAR(255) NOT NULL,
      buyer_whatsapp VARCHAR(20) NOT NULL,
      razorpay_order_id VARCHAR(255),
      razorpay_payment_id VARCHAR(255),
      razorpay_signature VARCHAR(500),
      amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      drive_link_sent BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // ── Admin table ──────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS admin (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}
