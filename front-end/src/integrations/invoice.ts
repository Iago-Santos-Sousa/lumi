import api from "./api";

import {
  IInvoiceDashboardData,
  IInvoiceDashboardDataParams,
} from "../types/invoice";

interface IUploadPdfResponse {
  succeeded: object[];
  failed: {
    filename: string;
    error: string;
  }[];
}

export const invoiceApi = () => ({
  getInvoicePdf: async (
    client_id: number | string,
    reference_month: string,
    invoice_id: number,
  ) => {
    client_id = Number(client_id);
    invoice_id = Number(invoice_id);
    reference_month = reference_month.replace("/", "-");

    const response = await api.get(
      `/upload/download/${client_id}/${reference_month}/${invoice_id}`,
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

  uploadInvoicePdf: async (pdfs: File[]) => {
    const formData = new FormData();
    pdfs.forEach((pdf) => formData.append("files", pdf));

    const response = await api.post<IUploadPdfResponse>(
      "/upload/upload-file",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  getInvoiceDashboardData: async (params: IInvoiceDashboardDataParams) => {
    const query = new URLSearchParams();
    if (params.client_number !== undefined) {
      query.set("client_number", String(params.client_number));
    }
    if (params.initial_date) {
      query.set("initial_date", params.initial_date);
    }
    if (params.final_date) {
      query.set("final_date", params.final_date);
    }

    const response = await api.get<IInvoiceDashboardData>(
      `/invoice/dashboard?${query.toString()}`,
    );

    return response.data;
  },
});
