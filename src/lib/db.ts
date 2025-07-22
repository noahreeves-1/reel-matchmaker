import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";

// Neon PostgreSQL with Drizzle ORM
// This file establishes the database connection and exports the db instance

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
