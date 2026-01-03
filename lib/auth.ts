import { betterAuth } from "better-auth";
import { env } from "process";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
//import { PrismaPg } from "@prisma/adapter-pg";

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
	},
	account: {},
	user: {
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "user",
			},
		},
	},
	database: prismaAdapter(prisma, {
		provider: "sqlserver", // or "mysql", "postgresql", ...etc
	}),
});
