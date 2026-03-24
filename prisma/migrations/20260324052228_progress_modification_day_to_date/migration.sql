/*
  Warnings:

  - You are about to drop the column `day` on the `Progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[participationId,date]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Progress_participationId_day_key";

-- AlterTable
ALTER TABLE "Progress" DROP COLUMN "day",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Progress_participationId_date_key" ON "Progress"("participationId", "date");
