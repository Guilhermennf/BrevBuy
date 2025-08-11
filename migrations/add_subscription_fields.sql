-- CreateIndex
CREATE UNIQUE INDEX "users_customerId_key" ON "users"("customerId");

-- AlterTable
ALTER TABLE "users" ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'free_trial';
ALTER TABLE "users" ADD COLUMN "trialStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN "trialEndDate" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "subscriptionId" TEXT;
ALTER TABLE "users" ADD COLUMN "customerId" TEXT;
ALTER TABLE "users" ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "planType" TEXT;