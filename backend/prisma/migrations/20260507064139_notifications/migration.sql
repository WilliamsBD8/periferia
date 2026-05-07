/*
  Warnings:

  - You are about to drop the column `notes` on the `tasks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,type,deleted_at]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[role_id,permission_id]` on the table `role_permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,deleted_at]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `tokens_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token,deleted_at]` on the table `tokens_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,deleted_at]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "notes";

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
