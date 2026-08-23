-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'rejected', 'resolved');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('post', 'comment', 'user');

-- CreateTable
CREATE TABLE "report_reason" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "report_reason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reason_id" TEXT NOT NULL,
    "reason_text" VARCHAR(280),
    "description" VARCHAR(2000),
    "target_type" "ReportTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_reason_name_key" ON "report_reason"("name");

-- CreateIndex
CREATE INDEX "report_reason_active_name_idx" ON "report_reason"("active", "name");

-- CreateIndex
CREATE INDEX "report_reporter_id_created_at_idx" ON "report"("reporter_id", "created_at");

-- CreateIndex
CREATE INDEX "report_status_created_at_idx" ON "report"("status", "created_at");

-- CreateIndex
CREATE INDEX "report_target_type_target_id_idx" ON "report"("target_type", "target_id");

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "report_reason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed the reasons required by the first reporting modal.
INSERT INTO "report_reason" ("id", "name", "description") VALUES
    ('report_reason_spam', 'Spam', 'Unwanted, repetitive, or promotional content.'),
    ('report_reason_harassment', 'Harassment or hate speech', 'Harassment, threats, bullying, or hateful conduct.'),
    ('report_reason_violence', 'Violence or dangerous content', 'Violent, threatening, or dangerous content.'),
    ('report_reason_sexual', 'Nudity or sexual content', 'Nudity, sexual content, or sexual exploitation.'),
    ('report_reason_misinformation', 'False or misleading information', 'Content intended to deceive or mislead people.'),
    ('report_reason_intellectual_property', 'Intellectual property violation', 'Unauthorized use of copyrighted or trademarked material.'),
    ('report_reason_other', 'Other', 'A reason not covered by the available categories.');
