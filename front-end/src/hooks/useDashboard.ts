import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";

import { invoiceApi } from "../integrations/invoice";
import { IInvoiceDashboardDataParams } from "../types/invoice";

interface AppliedFilters {
  clientNumber?: number;
  initialDate?: string;
  finalDate?: string;
}

export function useDashboard() {
  const [clientNumberInput, setClientNumberInput] = useState<string>("");
  const [initialDate, setInitialDate] = useState<Dayjs | null>(null);
  const [finalDate, setFinalDate] = useState<Dayjs | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});

  const queryParams: IInvoiceDashboardDataParams = {
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
    queryKey: ["dashboard", queryParams],
    queryFn: () => invoiceApi().getInvoiceDashboardData(queryParams),
    placeholderData: (prev) => prev,
  });

  const handleSearch = () => {
    const parsedClient = clientNumberInput.trim()
      ? parseInt(clientNumberInput.trim(), 10)
      : undefined;

    setAppliedFilters({
      clientNumber: parsedClient,
      initialDate: initialDate ? initialDate.format("YYYY-MM-DD") : undefined,
      finalDate: finalDate ? finalDate.format("YYYY-MM-DD") : undefined,
    });
  };

  const handleClear = () => {
    setClientNumberInput("");
    setInitialDate(null);
    setFinalDate(null);
    setAppliedFilters({});
  };

  return {
    clientNumberInput,
    initialDate,
    finalDate,
    data,
    isLoading,
    isError,
    setClientNumberInput,
    setInitialDate,
    setFinalDate,
    handleSearch,
    handleClear,
  };
}
