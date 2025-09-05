-- CreateTable
CREATE TABLE "HU" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "length_cm" INTEGER NOT NULL,
  "width_cm" INTEGER NOT NULL,
  "height_cm" INTEGER NOT NULL,
  "weight_kg" INTEGER NOT NULL,
  "stackable" BOOLEAN NOT NULL,
  "deliveryDate" DATETIME NOT NULL,
  "place" TEXT NOT NULL
);
