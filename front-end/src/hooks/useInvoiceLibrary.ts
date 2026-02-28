import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";

import { clientApi } from "../integrations/client";
import { invoiceApi } from "../integrations/invoice";
import { IClientPaginatedParams } from "../types/clients";
import { useToast } from "../context/ToastContext";

const ITEMS_PER_PAGE = 10;

interface AppliedFilters {
  clientNumber?: number;
  initialDate?: string;
  finalDate?: string;
}

export function useInvoiceLibrary() {
  const { showToast } = useToast();
  const [clientNumberInput, setClientNumberInput] = useState<string>("");
  const [initialDate, setInitialDate] = useState<Dayjs | null>(null);
  const [finalDate, setFinalDate] = useState<Dayjs | null>(null);

  const [page, setPage] = useState<number>(1);

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});

  const queryParams: IClientPaginatedParams = {
    page,
    limit: ITEMS_PER_PAGE,
    ...(appliedFilters.clientNumber !== undefined && {
      client_number: appliedFilters.clientNumber,
    }),
    ...(appliedFilters.initialDate && {
      initial_date: appliedFilters.initialDate,
    }),
    ...(appliedFilters.finalDate && {
      final_date: appliedFilters.finalDate,
    }),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoiceLibrary", queryParams],
    queryFn: () => clientApi().getClients(queryParams),
    placeholderData: (prev) => prev,
  });

  // Aplica os filtros e reseta para página 1
  const handleSearch = () => {
    const parsedClient = clientNumberInput.trim()
      ? parseInt(clientNumberInput.trim(), 10)
      : undefined;

    setAppliedFilters({
      clientNumber: parsedClient,
      initialDate: initialDate ? initialDate.format("YYYY-MM-DD") : undefined,
      finalDate: finalDate ? finalDate.format("YYYY-MM-DD") : undefined,
    });

    setPage(1);
  };

  // Limpa todos os filtros e reseta a busca
  const handleClear = () => {
    setClientNumberInput("");
    setInitialDate(null);
    setFinalDate(null);
    setAppliedFilters({});
    setPage(1);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };

  const downloadPdf = async (
    clientNumber: number | string,
    referenceMonth: string,
  ) => {
    try {
      const { pdfUrl, filename } = await invoiceApi().getInvoicePdf(
        clientNumber,
        referenceMonth,
      );

      // Cria um link temporário para download
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoga o URL do blob após o download
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("Erro ao baixar PDF: ", error);
      showToast("error", "Erro ao baixar PDF");
    }
  };

  return {
    // estado dos inputs
    clientNumberInput,
    initialDate,
    finalDate,

    // dados e status da query
    data,
    isLoading,
    isError,
    page,

    // setters dos inputs
    setClientNumberInput,
    setInitialDate,
    setFinalDate,

    // handlers
    handleSearch,
    handleClear,
    handlePageChange,

    downloadPdf,
  };
}
