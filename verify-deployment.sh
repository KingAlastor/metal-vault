#!/bin/bash

# Job History Deployment Verification Script
# Run this on your VPS after deployment to verify everything is working

echo "🔍 Verifying Job History Deployment..."

# Check if PostgreSQL is accessible
echo "1. Testing database connection..."
if psql -U postgres -d ${DATABASE_NAME:-metal_vault} -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Check if graphile_worker schema exists
echo "2. Checking graphile_worker schema..."
SCHEMA_EXISTS=$(psql -U postgres -d ${DATABASE_NAME:-metal_vault} -t -c "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'graphile_worker';")
if [[ $SCHEMA_EXISTS -eq 1 ]]; then
    echo "✅ graphile_worker schema exists"
else
    echo "❌ graphile_worker schema not found"
    exit 1
fi

# Check if job_history table exists
echo "3. Checking job_history table..."
TABLE_EXISTS=$(psql -U postgres -d ${DATABASE_NAME:-metal_vault} -t -c "SELECT 1 FROM information_schema.tables WHERE table_schema = 'graphile_worker' AND table_name = 'job_history';")
if [[ $TABLE_EXISTS -eq 1 ]]; then
    echo "✅ job_history table exists in graphile_worker schema"
else
    echo "❌ job_history table not found - deploying now..."
    psql -U postgres -d ${DATABASE_NAME:-metal_vault} -f deploy-job-history.sql
    if [ $? -eq 0 ]; then
        echo "✅ job_history table deployed successfully"
    else
        echo "❌ Failed to deploy job_history table"
        exit 1
    fi
fi

# Check PM2 processes
echo "4. Checking PM2 processes..."
if command -v pm2 > /dev/null 2>&1; then
    echo "PM2 Process Status:"
    pm2 list | grep -E "(metal-vault|Process)"
    
    # Check worker status specifically
    WORKER_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="metal-vault-worker") | .pm2_env.status' 2>/dev/null)
    if [[ "$WORKER_STATUS" == "online" ]]; then
        echo "✅ Worker is running"
    else
        echo "⚠️ Worker status: $WORKER_STATUS"
    fi
else
    echo "⚠️ PM2 not found - install with: npm install -g pm2"
fi

# Test worker once
echo "5. Testing worker execution..."
if npm run worker:once > /tmp/worker_test.log 2>&1; then
    echo "✅ Worker test successful"
    
    # Check if any jobs were logged
    JOB_COUNT=$(psql -U postgres -d ${DATABASE_NAME:-metal_vault} -t -c "SELECT COUNT(*) FROM graphile_worker.job_history WHERE created_at > NOW() - INTERVAL '5 minutes';")
    if [[ $JOB_COUNT -gt 0 ]]; then
        echo "✅ $JOB_COUNT job(s) logged in last 5 minutes"
    else
        echo "ℹ️ No jobs logged recently (normal if no scheduled tasks)"
    fi
else
    echo "⚠️ Worker test completed with warnings - check logs:"
    tail -5 /tmp/worker_test.log
fi

# Test API endpoint
echo "6. Testing job history API..."
if curl -s http://localhost:3000/api/worker/history > /dev/null; then
    echo "✅ Job history API accessible"
    
    # Get job stats
    RESPONSE=$(curl -s "http://localhost:3000/api/worker/history?stats=true")
    if echo "$RESPONSE" | grep -q "stats"; then
        echo "✅ Job statistics available"
        echo "$RESPONSE" | jq '.stats' 2>/dev/null || echo "Raw response: $RESPONSE"
    else
        echo "ℹ️ No job statistics yet (normal on first deployment)"
    fi
else
    echo "⚠️ Job history API not accessible - check Next.js app"
fi

# Summary
echo ""
echo "📊 Deployment Summary:"
echo "================================"
psql -U postgres -d ${DATABASE_NAME:-metal_vault} -c "
SELECT 
    'Total Jobs' as metric, 
    COUNT(*)::text as value 
FROM graphile_worker.job_history
UNION ALL
SELECT 
    'Completed Jobs', 
    COUNT(*)::text 
FROM graphile_worker.job_history 
WHERE status = 'completed'
UNION ALL
SELECT 
    'Failed Jobs', 
    COUNT(*)::text 
FROM graphile_worker.job_history 
WHERE status = 'failed'
UNION ALL
SELECT 
    'Recent Jobs (24h)', 
    COUNT(*)::text 
FROM graphile_worker.job_history 
WHERE created_at > NOW() - INTERVAL '24 hours';
"

echo ""
echo "🚀 Deployment verification complete!"
echo "💡 Next steps:"
echo "   - Monitor logs: pm2 logs metal-vault-worker"
echo "   - View job history: curl http://localhost:3000/api/worker/history"
echo "   - Check email tasks are working without PostgreSQL JSON errors"
