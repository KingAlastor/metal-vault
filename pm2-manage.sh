#!/bin/bash

# PM2 Management Script for Metal Vault

case "$1" in
  start)
    echo "Starting Metal Vault applications..."
    pm2 start ecosystem.config.js
    pm2 save
    ;;
  stop)
    echo "Stopping Metal Vault applications..."
    pm2 stop ecosystem.config.js
    ;;
  restart)
    echo "Restarting Metal Vault applications..."
    pm2 restart ecosystem.config.js
    ;;
  reload)
    echo "Reloading Metal Vault applications..."
    pm2 reload ecosystem.config.js
    ;;
  status)
    echo "Status of Metal Vault applications..."
    pm2 list
    ;;
  logs)
    if [ -z "$2" ]; then
      echo "Showing logs for all applications..."
      pm2 logs
    else
      echo "Showing logs for $2..."
      pm2 logs "$2"
    fi
    ;;
  delete)
    echo "Deleting Metal Vault applications from PM2..."
    pm2 delete ecosystem.config.js
    ;;
  monit)
    echo "Opening PM2 monitoring..."
    pm2 monit
    ;;
  worker-once)
    echo "Running worker once (for testing)..."
    npm run worker:once
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|reload|status|logs [app-name]|delete|monit|worker-once}"
    echo ""
    echo "Available applications:"
    echo "  - metal-vault-app (Next.js application)"
    echo "  - metal-vault-worker (Background worker)"
    echo ""
    echo "Examples:"
    echo "  $0 start              # Start both applications"
    echo "  $0 logs               # Show logs for both applications"
    echo "  $0 logs metal-vault-worker # Show logs for worker only"
    echo "  $0 worker-once        # Run worker once for testing"
    exit 1
    ;;
esac
