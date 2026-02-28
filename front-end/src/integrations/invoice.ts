import api from "./api";

import {
  IInvoice,
  IInvoicePaginated,
  IInvoicePaginatedParams,
} from "../types/invoices";

export const invoiceApi = () => ({
  getInvoicePdf: async (
    client_number: number | string,
    reference_month: string,
  ) => {
    client_number = Number(client_number);
    reference_month = reference_month.replace("/", "-");

    const response = await api.get(
      `/upload/download/${client_number}/${reference_month}`,
      {
        responseType: "blob",
      },
    );

    const contentDisposition = response.headers["content-disposition"];
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : "fatura.pdf";

    const pdfBlob = new Blob([response.data], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    return { pdfUrl, filename };
  },
});
