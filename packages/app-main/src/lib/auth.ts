import { betterAuth, APIError } from "better-auth";
import { env } from "process";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { EmailClient } from "@azure/communication-email";
import { getRequiredEnv } from "./environment";

// Initialize Azure Email Client with required connection string
const azureEmailClient = new EmailClient(getRequiredEnv("AZURE_CONNECTION_STRING"));

const ALLOWED_DOMAINS = ["koning.ca"];

export const auth = betterAuth({
	databaseHooks: {
    user: {
			create: {
				before: async (user) => {
					const email = user.email.toLowerCase();
					const domain = email.split("@")[1];

					if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
						throw new APIError("UNPROCESSABLE_ENTITY", {
							message: `Sorry, you do not have an authorized email domain. Please email to request access.`,
						});
					}
        },
			},
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url, token }, request) => {
			console.log("Sending verification email to", user.email);
			console.log("URL", url);
			console.log("Token", token);
			console.log("Request", request);
			
			const message = {
				senderAddress: getRequiredEnv("AZURE_SENDER_EMAIL"),
				content: {
					subject: "Verify your email address",
					plainText: `Please verify your email by clicking this link: ${url}`,
					html: `
						<html>
							<body>
								<h1>Verify your email</h1>
								<p>Click the link below to verify your email address:</p>
								<a href="${url}">Verify my email</a>
								<br/><br/>
								<p>Or copy and paste this link into your browser: ${url}</p>
							</body>
						</html>
					`,
				},
				recipients: {
					to: [{ address: user.email }],
				},
			};

			try {
				const poller = await azureEmailClient.beginSend(message);
				await poller.pollUntilDone();
				console.log(`Verification email sent to ${user.email}`);
			} catch (error) {
				console.error("Failed to send verification email via Azure:", error);
			}
		},
	},
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
		provider: "postgresql",
	}),
});
