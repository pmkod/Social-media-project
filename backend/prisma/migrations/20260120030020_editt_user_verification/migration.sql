/*
  Warnings:

  - You are about to drop the column `number_of_attempts` on the `user_verification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_verification" DROP COLUMN "number_of_attempts",
ADD COLUMN     "disabled_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "number_of_failed_attempts" SMALLINT NOT NULL DEFAULT 0;
