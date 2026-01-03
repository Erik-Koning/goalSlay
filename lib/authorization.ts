// Define it manually in your code
export const Role = {
	USER: "user",
	MODERATOR: "moderator",
	ADMIN: "admin",
	SUPERADMIN: "superadmin",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
