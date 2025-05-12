ALTER TABLE "payments" DROP CONSTRAINT "payments_transaction_code_unique";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "transaction_code" DROP NOT NULL;