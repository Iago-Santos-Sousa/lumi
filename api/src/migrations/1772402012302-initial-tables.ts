import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTables1772402012302 implements MigrationInterface {
    name = 'InitialTables1772402012302'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("user_id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "role" character varying(20) NOT NULL, "refresh_token" character varying DEFAULT '', "reset_token" character varying(255), "reset_token_expiry" bigint, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_bb2b6e1e67308fbea9e5bc13000" UNIQUE ("reset_token"), CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "client" ("id" SERIAL NOT NULL, "client_number" bigint NOT NULL, "name" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_763d82b4fe82272c08fc7e8f03c" UNIQUE ("client_number"), CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoice" ("id" SERIAL NOT NULL, "client_id" integer NOT NULL, "reference_month" character varying(12) NOT NULL, "reference_date" date NOT NULL, "client_name" character varying(255), "installation_number" character varying(255), "energia_eletrica_kwh" numeric(10,2) NOT NULL, "energia_eletrica_valor" numeric(10,2) NOT NULL, "energia_sceee_kwh" numeric(10,2) NOT NULL, "energia_sceee_valor" numeric(10,2) NOT NULL, "energia_compensada_kwh" numeric(10,2) NOT NULL, "energia_compensada_valor" numeric(10,2) NOT NULL, "contrib_ilum_publica" numeric(10,2) NOT NULL, "consumo_energia_eletrica_kwh" numeric(10,2) NOT NULL, "valor_total_sem_gd" numeric(10,2) NOT NULL, "economia_gd" numeric(10,2) NOT NULL, "pdf_filename" character varying(255), "pdf_path" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2c6ef4eff63e476139f396bf97c" UNIQUE ("client_id", "reference_date"), CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2c6ef4eff63e476139f396bf97" ON "invoice" ("client_id", "reference_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_61b7f0c71e3acdbbcd9e963dfb" ON "invoice" ("reference_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_c2dcbb1f285e8b596858aceb92" ON "invoice" ("client_id") `);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_c2dcbb1f285e8b596858aceb923" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_c2dcbb1f285e8b596858aceb923"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2dcbb1f285e8b596858aceb92"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61b7f0c71e3acdbbcd9e963dfb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2c6ef4eff63e476139f396bf97"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
