import { Task } from "graphile-worker";
import sql from "@/lib/db";
import { createEmail, EmailData } from "@/components/user/emailSettings/create-email";
import { sendMail } from "@/lib/email/send-email";

type EmailSettings = {
  preferred_email: string;
  email_frequency: string;
  favorite_bands: boolean;
  favorite_genres: boolean;
  email_updates_enabled: boolean;
};

type UserWithEmailSettings = {
  id: string;
  name: string;
  email: string;
  email_settings: EmailSettings; // Now JSONB object, not string
};

// Task to send scheduled emails to users based on their email settings
export const sendScheduledEmails: Task = async (payload, helpers) => {
  helpers.logger.info("Starting scheduled email task...");
    try {
    // Fetch all users with email_settings
    const users = await sql<UserWithEmailSettings[]>`
      SELECT id, name, email, email_settings
      FROM users
      WHERE email_settings IS NOT NULL 
      AND email_settings != 'null'::jsonb
      AND email_settings != '{}'::jsonb
      AND email IS NOT NULL
      AND email_settings @> '{"email_updates_enabled": true}'
      AND email_status = 'ACTIVE'
    `;

    helpers.logger.info(`Found ${users.length} users with email settings`);

    let emailsSent = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;

    for (const user of users) {
      try {
        const emailSettings: EmailSettings = user.email_settings;

        if (!emailSettings.email_updates_enabled) {
          helpers.logger.debug(`Email updates disabled for user ${user.id}`);
          emailsSkipped++;
          continue;
        }

        const recipientEmail = emailSettings.preferred_email || user.email;
        if (!recipientEmail) {
          helpers.logger.warn(`No email address found for user ${user.id}`);
          emailsSkipped++;
          continue;
        }

        helpers.logger.info(`Processing email for user ${user.id} (${recipientEmail})`);       
        const emailData: EmailData = {
          preferred_email: recipientEmail,
          email_frequency: emailSettings.email_frequency || "W",
          favorite_bands: emailSettings.favorite_bands || false,
          favorite_genres: emailSettings.favorite_genres || false,
        };       
        const emailContent = await createEmail(emailData, user.id);

        if (!emailContent.text || emailContent.text.trim() === "") {
          helpers.logger.debug(`No content to send for user ${user.id}`);
          emailsSkipped++;
          continue;
        }      
        const subject = `Metal Vault Newsletter - ${emailSettings.email_frequency === 'W' ? 'Weekly' : 'Monthly'} Update`;
        const result = await sendMail(
          user.id, 
          recipientEmail,
          subject,
          emailContent.text,
          emailContent.html
        );

        if (result.success) {
          helpers.logger.info(`Email sent successfully to user ${user.id} (${recipientEmail})`);
          
          try {
            await sql`
              UPDATE users 
              SET last_email_sent = NOW() 
              WHERE id = ${user.id}
            `;
            helpers.logger.debug(`Updated last_email_sent for user ${user.id}`);
          } catch (updateError) {
            helpers.logger.warn(`Failed to update last_email_sent for user ${user.id}: ${updateError}`);
          }
          
          emailsSent++;
        } else {
          helpers.logger.error(`Failed to send email to user ${user.id}: ${result.error}`);
          emailsFailed++;
        }

        // Add a small delay between emails to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (userError) {
        helpers.logger.error(`Error processing user ${user.id}: ${userError}`);
        emailsFailed++;
      }
    }

    helpers.logger.info(`Email task completed. Sent: ${emailsSent}, Skipped: ${emailsSkipped}, Failed: ${emailsFailed}`);

  } catch (error) {
    helpers.logger.error(`Scheduled email task failed: ${error}`);
    throw error; // Re-throw so graphile-worker knows the job failed
  }
};