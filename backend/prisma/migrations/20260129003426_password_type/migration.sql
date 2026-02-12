/*
  Warnings:

  - You are about to drop the column `goal_achievied_at` on the `user_verification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_verification" DROP COLUMN "goal_achievied_at",
ADD COLUMN     "goal_achieved_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "email" SET DATA TYPE VARCHAR;
