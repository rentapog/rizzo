import pg from 'pg';
import bcrypt from 'bcryptjs';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_BwyZxYlR87NP@ep-autumn-glitter-adml5yko-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
});

await client.connect();

// Check if rentapog user already exists
const existing = await client.query("SELECT id FROM users WHERE referral_code = 'rentapog'");
if (existing.rows.length > 0) {
  console.log("✓ User 'rentapog' already exists with ID:", existing.rows[0].id);
  await client.end();
  process.exit(0);
}

// Create default password hash
const hashedPassword = await bcrypt.hash('rentapog123', 10);

// Insert the rentapog user as a default affiliate account
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
    'admin@airizzos.com',
    'RentAPog Default',
    $1,
    'rentapog',
    true,
    true,
    null
  ) RETURNING id, email, referral_code
`, [hashedPassword]);

console.log("✓ Created rentapog affiliate account:");
console.log(result.rows[0]);
console.log("\nLogin credentials:");
console.log("  Email: admin@airizzos.com");
console.log("  Password: rentapog123");
console.log("  Referral Code: rentapog");

await client.end();
