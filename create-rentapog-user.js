
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

await client.connect();

const adminEmail = process.env.ADMIN_EMAIL || 'admin@rentapog.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'rentapog123';
const adminUsername = process.env.ADMIN_USERNAME || 'rentapog';

// Check if admin user already exists
const existing = await client.query("SELECT id FROM users WHERE email = $1", [adminEmail]);
const hashedPassword = await bcrypt.hash(adminPassword, 10);

if (existing.rows.length > 0) {
  // Update password and referral_code if needed
  await client.query(
    `UPDATE users SET password = $1, referral_code = 'rentapog', is_active = true, is_sub_admin = true WHERE email = $2`,
    [hashedPassword, adminEmail]
  );
  console.log(`✓ Updated admin user (${adminEmail}) with new password and referral_code 'rentapog'.`);
  await client.end();
  process.exit(0);
}

// Insert the admin user as a default affiliate account
const result = await client.query(`
  INSERT INTO users (
    email, 
    name, 
    password, 
    referral_code, 
    is_active,
    is_sub_admin,
    referred_by
  ) VALUES (
    $1,
    $2,
    $3,
    'rentapog',
    true,
    true,
    null
  ) RETURNING id, email, referral_code
`, [adminEmail, adminUsername, hashedPassword]);

console.log("✓ Created admin account:");
console.log(result.rows[0]);
console.log("\nLogin credentials:");
console.log(`  Email: ${adminEmail}`);
console.log(`  Password: ${adminPassword}`);
console.log("  Referral Code: rentapog");

await client.end();
