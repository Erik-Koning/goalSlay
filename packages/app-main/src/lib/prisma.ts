import { Pool, PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@chat-assistant/database";
import { env } from "process";

// Toggle between PgBouncer (port 6432) and direct PostgreSQL (port 5432)
// Set USE_PGBOUNCER=true in .env to enable PgBouncer mode
const usePgBouncer = env.USE_PGBOUNCER === "true";
const defaultPort = usePgBouncer ? "6432" : "5432";

// SSL is required for Azure PostgreSQL (set DB_SSL=false to disable for local dev)
const useSSL = env.DB_SSL !== "false";

// Build PostgreSQL connection string
const connectionString =
	env.DATABASE_URL ||
	`postgresql://${env.DB_USER}:${env.DB_KEY}@${env.DB_SERVER}:${env.DB_PORT || defaultPort}/${env.DB_NAME}`;

// Configure pool based on connection mode
const poolConfig: PoolConfig = {
	connectionString,
	// Azure PostgreSQL requires SSL
	...(useSSL && {
		ssl: { rejectUnauthorized: false },
	}),
	// PgBouncer in transaction mode requires max 1 connection per pool
	...(usePgBouncer && {
		max: 1,
	}),
};

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };
