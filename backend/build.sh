#!/usr/bin/env bash
# exit on error
set -o errexit

pnpm install --no-frozen-lockfile
npx prisma generate
pnpm build
npx prisma migrate deploy 