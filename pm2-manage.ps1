# PM2 Management Script for Metal Vault (PowerShell)

param(
    [Parameter(Mandatory=$true)]
    [string]$Action,
    [string]$AppName
)

switch ($Action) {
    "start" {
        Write-Host "Starting Metal Vault applications..." -ForegroundColor Green
        pm2 start ecosystem.config.js
        pm2 save
    }
    "stop" {
        Write-Host "Stopping Metal Vault applications..." -ForegroundColor Yellow
        pm2 stop ecosystem.config.js
    }
    "restart" {
        Write-Host "Restarting Metal Vault applications..." -ForegroundColor Blue
        pm2 restart ecosystem.config.js
    }
    "reload" {
        Write-Host "Reloading Metal Vault applications..." -ForegroundColor Blue
        pm2 reload ecosystem.config.js
    }
    "status" {
        Write-Host "Status of Metal Vault applications..." -ForegroundColor Cyan
        pm2 list
    }
    "logs" {
        if ([string]::IsNullOrEmpty($AppName)) {
            Write-Host "Showing logs for all applications..." -ForegroundColor Cyan
            pm2 logs
        } else {
            Write-Host "Showing logs for $AppName..." -ForegroundColor Cyan
            pm2 logs $AppName
        }
    }
    "delete" {
        Write-Host "Deleting Metal Vault applications from PM2..." -ForegroundColor Red
        pm2 delete ecosystem.config.js
    }
    "monit" {
        Write-Host "Opening PM2 monitoring..." -ForegroundColor Magenta
        pm2 monit
    }
    "worker-once" {
        Write-Host "Running worker once (for testing)..." -ForegroundColor Yellow
        npm run worker:once
    }
    default {
        Write-Host "Usage: .\pm2-manage.ps1 -Action {start|stop|restart|reload|status|logs|delete|monit|worker-once} [-AppName app-name]" -ForegroundColor Red
        Write-Host ""
        Write-Host "Available applications:" -ForegroundColor White
        Write-Host "  - metal-vault-app (Next.js application)" -ForegroundColor Gray
        Write-Host "  - metal-vault-worker (Background worker)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor White
        Write-Host "  .\pm2-manage.ps1 -Action start              # Start both applications" -ForegroundColor Gray
        Write-Host "  .\pm2-manage.ps1 -Action logs               # Show logs for both applications" -ForegroundColor Gray
        Write-Host "  .\pm2-manage.ps1 -Action logs -AppName metal-vault-worker # Show logs for worker only" -ForegroundColor Gray
        Write-Host "  .\pm2-manage.ps1 -Action worker-once        # Run worker once for testing" -ForegroundColor Gray
        exit 1
    }
}
