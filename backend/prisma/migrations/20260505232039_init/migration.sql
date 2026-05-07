-- CreateEnum
CREATE TYPE "StatusUser" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TypePermission" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "status" "StatusUser" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_users" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tokens_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TypePermission" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_deleted" ON "roles"("name") WHERE "deleted_at" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_deleted" ON "users"("email") WHERE "deleted_at" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tokens_users_token_key" ON "tokens_users"("token");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_users_token_deleted" ON "tokens_users"("token") WHERE "deleted_at" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_type_deleted" ON "permissions"("name", "type") WHERE "deleted_at" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id" ON "role_permissions"("role_id", "permission_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_users" ADD CONSTRAINT "tokens_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Función que bloquea cambios en el token
CREATE OR REPLACE FUNCTION prevent_token_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.token <> OLD.token THEN
    RAISE EXCEPTION 'El campo token no puede modificarse';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER no_update_token
BEFORE UPDATE ON "tokens_users"
FOR EACH ROW
EXECUTE FUNCTION prevent_token_update();


-- Función para realizar soft delete automáticamente
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    EXECUTE format(
      'UPDATE %I SET deleted_at = NOW() WHERE id = $1',
      TG_TABLE_NAME
    )
    USING OLD.id;

    RETURN NULL; -- evita el delete real
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper para crear triggers dinámicamente para tablas con deleted_at
DO $$
DECLARE
    r RECORD;
    trigger_name TEXT;
BEGIN
    FOR r IN 
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'deleted_at'
          AND table_schema = 'public'
    LOOP
        trigger_name := 'soft_delete_' || r.table_name || '_trg';

        EXECUTE format('
            DROP TRIGGER IF EXISTS %I ON %I;
            CREATE TRIGGER %I
            BEFORE DELETE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION soft_delete();',
            trigger_name, r.table_name, trigger_name, r.table_name
        );
    END LOOP;
END;
$$;