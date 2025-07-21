# Worker Compilation Fix - Deployment Guide

## Problem Solved
The GraphQL worker was failing at runtime because TypeScript path aliases (`@/*`) weren't being resolved during compilation, causing module resolution errors in the compiled JavaScript.

## Solution Implemented
1. **Added `tsc-alias`** to properly resolve TypeScript path aliases during compilation
2. **Updated build process** to compile TypeScript AND resolve path aliases
3. **Simplified PM2 configuration** to run compiled JavaScript directly (no runtime path resolution needed)
4. **Fixed worker scripts** to use native Node.js execution

## Changes Made

### `package.json`
- Updated `build:worker` script: `tsc --project tsconfig.worker.json && tsc-alias -p tsconfig.worker.json`
- Simplified worker scripts to use direct Node.js execution
- Added `tsc-alias` as dev dependency

### `tsconfig.worker.json`
- Updated `baseUrl` and `paths` configuration for proper path resolution
- Added additional compiler options for better CommonJS compatibility

### `ecosystem.config.js`
- Simplified worker command to `node dist/worker/index.js`
- Removed complex path resolution flags

## Verification
✅ Worker compiles successfully with resolved path aliases  
✅ Compiled JavaScript uses relative imports (no more `@/*`)  
✅ Worker module loads without module resolution errors  
✅ Worker fails properly when DATABASE_URL is missing (expected behavior)  

## Next Steps for VPS Deployment
1. Push these changes to your repository
2. On your Ubuntu VPS:
   ```bash
   git pull
   npm install  # Install tsc-alias if needed
   npm run build
   pm2 restart ecosystem.config.js
   pm2 list
   pm2 logs metal-vault-worker --lines 20
   ```

The worker should now start successfully on your VPS without the module resolution errors!
