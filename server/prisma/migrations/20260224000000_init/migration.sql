CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "children" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in',
    "createdAt" TEXT DEFAULT (CURRENT_DATE::text),
    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in',
    "createdAt" TEXT DEFAULT (CURRENT_DATE::text),
    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attendance_children" (
    "id" SERIAL NOT NULL,
    "childId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    CONSTRAINT "attendance_children_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attendance_staff" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    CONSTRAINT "attendance_staff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "logbook" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "exitTime" TIMESTAMP(3),
    "returnTime" TIMESTAMP(3),
    CONSTRAINT "logbook_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "volunteers_log" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "reason" TEXT,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "departureTime" TIMESTAMP(3),
    CONSTRAINT "volunteers_log_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");
CREATE UNIQUE INDEX "attendance_children_childId_date_key" ON "attendance_children"("childId", "date");
CREATE UNIQUE INDEX "attendance_staff_staffId_date_key" ON "attendance_staff"("staffId", "date");

ALTER TABLE "attendance_children" ADD CONSTRAINT "attendance_children_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendance_staff" ADD CONSTRAINT "attendance_staff_staffId_fkey"
    FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
