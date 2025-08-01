/*
  Warnings:

  - A unique constraint covering the columns `[customerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "planType" TEXT,
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'free_trial',
ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ADD COLUMN     "trialStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "users_customerId_key" ON "users"("customerId");
