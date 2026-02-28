import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumberString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class DashboardQueryDto {
  /**
   * Filtra faturas de um cliente específico pelo número CEMIG.
   * Exemplo: 7202210726
   */
  @ApiPropertyOptional({
    description: "Número do cliente (CEMIG)",
    example: "7202210726",
  })
  @IsOptional()
  @IsNumberString()
  client_number?: string;

  /**
   * Data inicial do período de análise (ISO 8601).
   * Exemplo: 2024-01-01
   */
  @ApiPropertyOptional({
    description: "Data inicial do período",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateString()
  initial_date?: string;

  /**
   * Data final do período de análise (ISO 8601).
   * Exemplo: 2024-12-31
   */
  @ApiPropertyOptional({
    description: "Data final do período",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString()
  final_date?: string;
}
