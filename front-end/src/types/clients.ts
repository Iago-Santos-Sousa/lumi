import { IInvoice } from "./invoice";

// Clientes
export interface IClient {
  id: number;
  client_number: number;
  name: string | null;
  created_at: string;
  updated_at: string;
  invoices: IInvoice[]; // faturas associadas a esse cliente
}

export interface IClientPaginated {
  results: IClient[];
  page: number;
  total: number;
  pageTotal: number;
}

export interface IClientPaginatedParams {
  page: number;
  limit: number;
  client_number?: number;
  initial_date?: string; // formato: "2024-02-13" (ano-mês-dia)
  final_date?: string; // formato: "2024-05-20" (ano-mês-dia)
}
