-- CreateTable
CREATE TABLE "Child" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDatetime" DATETIME NOT NULL,
    "extraData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Feeding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "foodType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "childId" INTEGER NOT NULL,
    "extraData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Feeding_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
