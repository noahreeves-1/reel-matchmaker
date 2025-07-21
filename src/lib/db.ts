import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";

// DATABASE CONNECTION: Neon PostgreSQL with Drizzle ORM
// This file establishes the database connection and exports the db instance
// Used throughout the application for database operations

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
