-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "customer_phone" TEXT,
    "customer_name" TEXT,
    "customer_address" TEXT,
    "customer_note" TEXT,
    "items" TEXT,
    "total_price" TEXT,
    "status" TEXT,
    "create_at" TIMESTAMPTZ(6),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
