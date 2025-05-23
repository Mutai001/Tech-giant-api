import "dotenv/config";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from './schema';


const databaseUrl = process.env.DATABASE_URL as string;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(databaseUrl);

export const db: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema, logger: true });
export default db;


// import "dotenv/config";
// import { drizzle } from "drizzle-orm/node-postgres"; // <-- Use pg driver
// import { Pool } from "pg";
// import * as schema from "./schema";

// // Validate the environment variable
// const databaseUrl = process.env.DATABASE_URL;
// if (!databaseUrl) {
//   throw new Error("❌ DATABASE_URL environment variable is not set.");
// }

// // Create a PostgreSQL connection pool
// const pool = new Pool({
//   connectionString: databaseUrl,
// });

// // Initialize Drizzle with schema and logger
// export const db = drizzle(pool, {
//   schema,
//   logger: true,
// });

// export default db;
