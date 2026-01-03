import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "@src/generated/prisma/client";
import { env } from "process";

const config = {
	server: env.DB_SERVER,
	port: env.DB_PORT,
	database: env.DB_NAME,
	user: env.DB_USER,
	password: env.DB_KEY,
	options: {
		encrypt: true, // Use this if you're on Windows Azure
		trustServerCertificate: true, // Use this if you're using self-signed certificates
	},
};

const adapter = new PrismaMssql(config);
const prisma = new PrismaClient({ adapter });

export { prisma };
