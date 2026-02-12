-- AlterTable
ALTER TABLE "article" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "cart_article" (
    "user_id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "quantity" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "cart_article_user_id_article_id_key" ON "cart_article"("user_id", "article_id");

-- AddForeignKey
ALTER TABLE "cart_article" ADD CONSTRAINT "cart_article_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_article" ADD CONSTRAINT "cart_article_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
