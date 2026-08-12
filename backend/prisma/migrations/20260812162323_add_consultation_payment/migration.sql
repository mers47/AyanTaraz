-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "ConsultationBooking" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "receiptFileName" TEXT,
ADD COLUMN     "receiptUrl" TEXT;

-- CreateIndex
CREATE INDEX "ConsultationBooking_paymentStatus_idx" ON "ConsultationBooking"("paymentStatus");
