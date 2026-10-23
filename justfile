# Common tasks. Install `just` (https://just.systems), then run `just` to list them.

default:
    @just --list

# Start the site with hot reload
dev:
    pnpm --filter @prexorlabs/web dev

# Build the site and serve it from the local Workers runtime, as it runs in production
preview:
    pnpm --filter @prexorlabs/web preview

# Everything CI checks, in the same order
check:
    pnpm format:check
    pnpm --filter @prexorlabs/web lint
    pnpm --filter @prexorlabs/web check
    pnpm --filter @prexorlabs/web build

# Format all code
format:
    pnpm format
