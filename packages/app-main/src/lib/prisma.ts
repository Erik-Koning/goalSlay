import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "@chat-assistant/database";
import { env } from "process";

const config = {
	server: env.DB_SERVER,
	port: Number(env.DB_PORT) || 1433,
	database: env.DB_NAME,
	user: env.DB_USER,
	password: env.DB_KEY,
	options: {
		encrypt: true, // Use this if you're on Windows Azure
		trustServerCertificate: false, // Use this if you're using self-signed certificates
	},
};

const adapter = new PrismaMssql(config);
const prisma = new PrismaClient({ adapter });

export { prisma };
