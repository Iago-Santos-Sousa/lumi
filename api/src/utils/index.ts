import { BadRequestException } from "@nestjs/common";

/**
 * Converte string no formato brasileiro para number.
 * Ex: "1.172,31" → 1172.31 | "-1.120,85" → -1120.85
 */
export function parseNumber(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(normalized);

  if (isNaN(parsed)) {
    throw new BadRequestException(
      `Valor inválido encontrado no PDF: "${value}"`,
    );
  }

  return parsed;
}
