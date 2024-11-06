import { drizzle } from 'drizzle-orm/vercel-postgres';
import { migrate } from 'drizzle-orm/vercel-postgres/migrator';
import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = drizzle(sql);

async function main() {
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migracja zakończona sukcesem');
  } catch (error) {
    console.error('Błąd podczas migracji:', error);
    process.exit(1);
  }
  process.exit(0);
}

main();