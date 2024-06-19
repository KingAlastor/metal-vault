-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bands_settings" JSONB,
ADD COLUMN     "email_settings" JSONB,
ADD COLUMN     "release_settings" JSONB;
