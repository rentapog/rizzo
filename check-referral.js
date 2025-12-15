import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_BwyZxYlR87NP@ep-autumn-glitter-adml5yko-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
});

await client.connect();
const result = await client.query("SELECT id, email, name, referral_code FROM users WHERE referral_code = 'rentapog'");
console.log("Users with referral_code 'rentapog':", result.rows);
await client.end();
