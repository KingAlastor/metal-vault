# Email Tasks Implementation

## Overview
This implementation creates a graphile-worker job that automatically sends scheduled emails to users based on their email preferences.

## How it Works

### 1. Email Task (`sendScheduledEmails`)
- **Location**: `src/worker/tasks/email-tasks.ts`
- **Function**: Processes all users with email settings and sends personalized newsletters
- **Schedule**: 
  - Weekly emails: Every Saturday at 9 AM
  - Monthly emails: 1st of every month at 9 AM

### 2. Email Settings Structure
Users' email settings are stored as JSON strings in the `users.email_settings` column:
```json
{
  "preferred_email": "user@example.com",
  "email_frequency": "W", // "W" for weekly, "M" for monthly
  "favorite_bands": true,
  "favorite_genres": false,
  "email_updates_enabled": true
}
```

### 3. Email Content Generation
- **Favorite Bands**: Fetches upcoming releases from bands the user follows
- **Favorite Genres**: Fetches releases matching user's preferred genres (excluding followed bands)
- **Content**: Includes both text and HTML versions with release dates, band names, and album names

### 4. Database Queries
The worker uses specialized functions that don't rely on session context:
- `getFavoriteBandReleasesForEmailWorker(userId, frequency)`
- `getFavoriteGenreReleasesForEmailWorker(userId, frequency)`

### 5. Email Service
Uses AWS SES via nodemailer for sending emails with proper error handling and success tracking.

## Task Configuration

### Cron Schedule
```javascript
const crontab = [
  "0 9 * * 6 send_weekly_emails",   // Saturday 9 AM for weekly
  "0 9 1 * * send_monthly_emails",  // 1st of month 9 AM for monthly
].join("\n");
```

### Task Registration
```javascript
taskList: {
  send_weekly_emails: sendScheduledEmails,
  send_monthly_emails: sendScheduledEmails,
}
```

## Error Handling
- Skips users with invalid email settings JSON
- Skips users with `email_updates_enabled: false`
- Logs all operations with detailed status tracking
- Continues processing other users if one fails
- Includes rate limiting (100ms delay between emails)

## Logging & Monitoring
The task provides comprehensive logging:
- Total users processed
- Emails sent successfully
- Emails skipped (disabled, no content, etc.)
- Emails failed (with error details)

## Testing
Use the test script: `node test-email-task.js`

## Database Dependencies
- `users` table with `email_settings` column
- `upcoming_releases` table with band and album data
- `band_followers_X` tables (sharded by user shard)
- User genre preferences in `users.genre_tags`
