-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('ACTIVE', 'LEFT');

-- AlterTable
ALTER TABLE "Participation" ADD COLUMN     "status" "ParticipationStatus" NOT NULL DEFAULT 'ACTIVE';
