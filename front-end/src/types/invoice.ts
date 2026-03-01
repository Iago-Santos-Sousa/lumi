export interface IInvoice {
  id: number;
  client_id: number;
  reference_month: string; // está nesse formato vindo do bacck-end: JAN/2024
  reference_date: string; // está nesse formato vindo do bacck-end: 2024-01-01
  installation_number: string | null;
  energia_eletrica_kwh: number;
  energia_eletrica_valor: number;
  energia_sceee_kwh: number;
  energia_sceee_valor: number;
  energia_compensada_valor: number;
  ontrib_ilum_publica: number;
  consumo_energia_eletrica_kwh: number;
  valor_total_sem_gd: number;
  economia_gd: number;
  pdf_filename: string | null;
  pdf_path: string | null;
  updated_at: string;
}

export interface IInvoiceDashboardData {
  totals: {
    consumo_energia_eletrica_kwh: number;
    energia_compensada_kwh: number;
    valor_total_sem_gd: number;
    economia_gd: number;
  };
  chart: {
    reference_month: string;
    reference_date: Date;
    consumo_energia_eletrica_kwh: number;
    energia_compensada_kwh: number;
    valor_total_sem_gd: number;
    economia_gd: number;
  }[];
}

export interface IInvoiceDashboardDataParams {
  client_number?: number;
  initial_date?: string;
  final_date?: string;
}
