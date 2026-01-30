import 'dotenv/config'
import { defineConfig, env } from "prisma/config";

// Build DATABASE_URL from individual env vars if not provided directly
const usePgBouncer = process.env.USE_PGBOUNCER === "true";
const defaultPort = usePgBouncer ? "6432" : "5432";

const databaseUrl =
	process.env.DATABASE_URL ||
	`postgresql://${process.env.DB_USER}:${process.env.DB_KEY}@${process.env.DB_SERVER}:${process.env.DB_PORT || defaultPort}/${process.env.DB_NAME}?sslmode=require`;

export default defineConfig({
	schema: "packages/database/prisma/schema.prisma",
	migrations: {
		path: "packages/database/prisma/migrations",
		seed: "tsx packages/database/prisma/seed.ts",
	},
	datasource: {
		url: databaseUrl,
	},
});