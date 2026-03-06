import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default sql;

export async function initDB() {
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

  await sql`
    CREATE TABLE IF NOT EXISTS admin (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Insert default admin if not exists (username: admin, password: admin123)
  // CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN
  const existing = await sql`SELECT id FROM admin WHERE username = 'admin'`;
  if (existing.length === 0) {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('admin123', 12);
    await sql`INSERT INTO admin (username, password_hash) VALUES ('admin', ${hash})`;
  }
}
