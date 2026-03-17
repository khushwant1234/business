ALTER TABLE "DeliveryAddress"
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'India',
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "deliveryInstructions" TEXT;