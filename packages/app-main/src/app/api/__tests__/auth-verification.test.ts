/**
 * API Route Auth Verification Tests
 *
 * Ensures all API routes have proper authentication checks.
 * Run with: pnpm test
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function findRouteFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findRouteFiles(fullPath, files);
    } else if (entry.name === "route.ts") {
      files.push(fullPath);
    }
  }
  return files;
}

// Routes that are exempt from requireAuth check
const EXEMPT_ROUTES = [
  // Better Auth handler - manages its own authentication
  "api/auth/[...all]/route.ts",
  // Health check endpoint - intentionally public
  "api/route.ts",
  // Cron job with its own secret-based authentication
  "api/notifications/check-progress/route.ts",
];

function normalizeRoutePath(fullPath: string): string {
  const match = fullPath.match(/\/api\/.*$/);
  return match ? match[0].slice(1) : fullPath; // Remove leading slash
}

function isExemptRoute(routePath: string): boolean {
  const normalized = normalizeRoutePath(routePath);
  return EXEMPT_ROUTES.some((exempt) => normalized.endsWith(exempt));
}

describe("API Route Authentication Verification", () => {
  it("should have requireAuth check in all non-exempt API routes", () => {
    const apiDir = path.resolve(__dirname, "..");
    const routeFiles = findRouteFiles(apiDir);

    const missingAuth: string[] = [];
    const checkedRoutes: string[] = [];

    for (const routeFile of routeFiles) {
      const relativePath = normalizeRoutePath(routeFile);

      // Skip exempt routes
      if (isExemptRoute(routeFile)) {
        continue;
      }

      const content = fs.readFileSync(routeFile, "utf-8");

      // Check for requireAuth import and usage
      const hasRequireAuthImport = content.includes('from "@/lib/authorization"');
      const hasRequireAuthCall = content.includes("requireAuth(");

      checkedRoutes.push(relativePath);

      if (!hasRequireAuthImport || !hasRequireAuthCall) {
        missingAuth.push(relativePath);
      }
    }

    // Output helpful information
    if (missingAuth.length > 0) {
      console.log("\nRoutes missing requireAuth:");
      missingAuth.forEach((route) => console.log(`  - ${route}`));
    }

    console.log(`\nChecked ${checkedRoutes.length} routes, ${EXEMPT_ROUTES.length} exempt`);

    expect(missingAuth).toEqual([]);
  });

  it("should have exempt routes list that matches actual files", () => {
    const apiDir = path.resolve(__dirname, "..");
    const routeFiles = findRouteFiles(apiDir);

    const actualExemptRoutes = routeFiles.filter((f) => isExemptRoute(f));
    const normalizedActual = actualExemptRoutes.map(normalizeRoutePath);

    // Verify each exempt route actually exists
    for (const exempt of EXEMPT_ROUTES) {
      const exists = normalizedActual.some((r) => r.endsWith(exempt));
      expect(exists, `Exempt route ${exempt} should exist in codebase`).toBe(true);
    }
  });

  it("should verify exempt routes have appropriate alternative auth", () => {
    const apiDir = path.resolve(__dirname, "..");
    const routeFiles = findRouteFiles(apiDir);

    for (const routeFile of routeFiles) {
      if (!isExemptRoute(routeFile)) continue;

      const content = fs.readFileSync(routeFile, "utf-8");
      const relativePath = normalizeRoutePath(routeFile);

      // Check for appropriate auth based on the route type
      if (relativePath.includes("auth/[...all]")) {
        // Better Auth should export auth handlers
        expect(content).toMatch(/export\s+const\s+\{/);
      } else if (relativePath.includes("check-progress")) {
        // Cron job should check for CRON_SECRET
        expect(content).toContain("CRON_SECRET");
      }
      // Health check doesn't need any auth
    }
  });

  it("should have admin routes checking for ADMIN role", () => {
    const apiDir = path.resolve(__dirname, "..");
    const allRouteFiles = findRouteFiles(apiDir);
    const routeFiles = allRouteFiles.filter((f) => f.includes("/admin/"));

    for (const routeFile of routeFiles) {
      const content = fs.readFileSync(routeFile, "utf-8");
      const relativePath = normalizeRoutePath(routeFile);

      // Admin routes should have role permission check
      const hasRoleCheck =
        content.includes("Role.ADMIN") || content.includes('role: "admin"');

      expect(hasRoleCheck, `Admin route ${relativePath} should check for ADMIN role`).toBe(
        true
      );
    }
  });

  it("should have LLM routes with rate limiting", () => {
    const llmRoutes = [
      "goals/experts/review/route.ts",
      "goals/validate/route.ts",
      "daily-updates/extract/route.ts",
    ];

    const apiDir = path.resolve(__dirname, "..");

    for (const llmRoute of llmRoutes) {
      const fullPath = path.resolve(apiDir, llmRoute);
      const content = fs.readFileSync(fullPath, "utf-8");

      // Should have rate limit parameter in requireAuth call
      const hasRateLimit = content.includes("rateLimit:");

      expect(hasRateLimit, `LLM route ${llmRoute} should have rate limiting`).toBe(true);
    }
  });
});
