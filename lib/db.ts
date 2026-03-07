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
  // Migrations for is_active
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`;
  // Note: We do NOT force all products to active here --
  // that would override admin 'hide product' setting.
  await sql`ALTER TABLE products ALTER COLUMN is_active SET DEFAULT true`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS bonus_links JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS order_bump_product_id INTEGER`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS order_bump_price DECIMAL(10,2)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS order_bump_description TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10,2)`;

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
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cart_items JSONB DEFAULT '[]'`;

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
