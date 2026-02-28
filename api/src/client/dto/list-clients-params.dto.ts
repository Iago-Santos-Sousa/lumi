/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class ListClientsParamsDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => (value ? value.trim() : value))
  clientName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => (value ? value.trim() : value))
  reference_date?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => (value ? value.trim() : value))
  reference_month?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => (value ? value.trim() : value))
  pdf_filename?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  client_number?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => (value ? value.trim() : value))
  initial_date?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => (value ? value.trim() : value))
  final_date?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  limit?: number;
}
