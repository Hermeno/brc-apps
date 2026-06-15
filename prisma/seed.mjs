import bcryptjs from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;
import { randomUUID } from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Strip sslmode — controlled via ssl option
const connectionString = DATABASE_URL.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '').replace(/\?$/, '');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const ADMIN_EMAIL    = 'admin@brclean.com';
const ADMIN_PASSWORD = 'Admin@2024!';
const ADMIN_NAME     = 'Admin';

async function seed() {
  const hashed = await bcryptjs.hash(ADMIN_PASSWORD, 10);

  const { rows } = await pool.query(
    `INSERT INTO "User" (
       id, email, password, name, role,
       "isVerified", "isAvailable", "hasPaymentMethod",
       "serviceRadiusMiles", plan, "serviceTypes",
       "createdAt", "updatedAt"
     ) VALUES (
       $1, $2, $3, $4, 'ADMIN',
       true, true, false,
       25, 'FREE', '{}',
       NOW(), NOW()
     )
     ON CONFLICT (email)
       DO UPDATE SET password = $3, role = 'ADMIN', name = $4, "updatedAt" = NOW()
     RETURNING id, email, role`,
    [randomUUID(), ADMIN_EMAIL, hashed, ADMIN_NAME]
  );

  console.log('✓ Admin criado/atualizado:', rows[0]);
  await pool.end();
}

seed().catch(err => {
  console.error('Seed falhou:', err.message);
  process.exit(1);
});
