export interface ExtractedInvoiceData {
  // Identificação
  client_number: string;
  installation_number: string;
  reference_month: string; // "JAN/2024"  → para exibição
  reference_date: Date; // 2024-01-01  → para queries

  // Dados brutos
  energia_eletrica_kwh: number;
  energia_eletrica_valor: number;
  energia_sceee_kwh: number;
  energia_sceee_valor: number;
  energia_compensada_kwh: number;
  energia_compensada_valor: number;
  contrib_ilum_publica: number;

  // Dados calculados
  consumo_energia_eletrica_kwh: number;
  valor_total_sem_gd: number;
  economia_gd: number;

  client_name: string | null;
  address: string | null;
  neighborhood: string | null;
  city_state: string | null;
  document_type: string | null; // "CNPJ" ou "CPF"
  document_number: string | null;
}
