# PNPM Workspaces & Catalogs

Managing a monorepo (such as a project with a root application and shared common packages) can lead to **"dependency hell"**—where different parts of the project use conflicting versions of the same library. PNPM addresses this through two primary features: **Workspaces** and **Catalogs**.

---

### 1. Workspaces
A **Workspace** enables the management of multiple projects (packages) within a single repository.

*   **Functionality**: It links local packages together. For instance, a main application can depend on a `@shared/common` package as if it were a standard npm library.
*   **Benefits**: Changes made in a shared package are immediately reflected in the dependent applications without requiring manual publishing or complex build steps.

### 2. Catalogs
**Catalogs** (introduced in PNPM v9.5+) serve as the **"Single Source of Truth"** for dependency versions across the workspace.

*   **Functionality**: Instead of duplicating version numbers (e.g., `^19.2.0`) across multiple `package.json` files, versions are defined once in `pnpm-workspace.yaml`. Individual projects then reference these versions using the `"catalog:"` protocol.
*   **Benefits**:
    *   **Version Consistency**: Ensures all packages in the monorepo remain synchronized.
    *   **Streamlined Upgrades**: Updating a library version in the workspace file applies the change across the entire monorepo instantly.
    *   **Optimized Performance**: PNPM resolves and stores only a single version of each shared library, reducing installation time and disk usage.

---

### 🚀 CLI Cheat Sheet

#### Adding a Package to the Catalog
To add a new dependency and register it within the workspace catalog:

```bash
# Adds the dependency to the default 'catalog' in pnpm-workspace.yaml
pnpm add <package-name> --save-catalog
```

#### Installing Across the Entire Workspace
To add a dependency to every project in the repository while maintaining it in the catalog:

```bash
# The '-r' flag (recursive) applies the command to all packages
pnpm add <package-name> --save-catalog -r
```

#### Utilizing Named Catalogs
For projects requiring specific version sets for different environments (e.g., legacy support):

```bash
# Adds the dependency to a specific named catalog (e.g., 'react18')
pnpm add <package-name> --save-catalog-name react18
```

---

### Summary of Benefits

| Feature | Problem Solved |
| :--- | :--- |
| **Workspaces** | Eliminates the need for manual linking or publishing of local shared code. |
| **Catalogs** | Prevents version mismatch bugs and "Multiple versions of React" errors. |
| **PNPM** | Minimizes disk usage and increases performance through a content-addressable store. |
