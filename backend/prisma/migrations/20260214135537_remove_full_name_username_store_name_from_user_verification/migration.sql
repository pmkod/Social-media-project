/*
  Warnings:

  - You are about to drop the column `full_name` on the `user_verification` table. All the data in the column will be lost.
  - You are about to drop the column `store_name` on the `user_verification` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `user_verification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_verification" DROP COLUMN "full_name",
DROP COLUMN "store_name",
DROP COLUMN "username";
