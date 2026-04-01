-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedById" TEXT,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
