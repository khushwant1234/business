ALTER TABLE "Product"
ADD COLUMN "sku" TEXT,
ADD COLUMN "isInStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "highlights" JSONB,
ADD COLUMN "features" JSONB,
ADD COLUMN "packageIncludes" JSONB,
ADD COLUMN "specifications" JSONB,
ADD COLUMN "attachments" JSONB,
ADD COLUMN "videoUrl" TEXT,
ADD COLUMN "qna" JSONB,
ADD COLUMN "otherInfo" JSONB,
ADD COLUMN "brand" TEXT,
ADD COLUMN "tags" JSONB;
