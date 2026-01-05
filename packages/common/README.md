A package of reusable TSX components, hooks, utils, and other files that a typical typescript web UI will benefit from.

### Install

This package is designed to fit into a pnpm mono repo. Drop it into a tsconfig for that ts directory to use via an @ alias such as:
"@common/_": ["../common/src/_"],

For a pnpm monorepo you must alos specify it as a dependency in any sub project that requires it.
