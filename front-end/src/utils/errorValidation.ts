import { isAxiosError } from "axios";

export const handleErrorMessage = (error: unknown) => {
  let errorMessage: string = "";

  if (isAxiosError(error)) {
    const axiosError = error;
    const statusCode: number | undefined = axiosError.response?.status;
    errorMessage =
      statusCode && statusCode > 406
        ? "Erro inesperado"
        : axiosError.response?.data?.message || "Ops, algo deu errado";
  }

  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return errorMessage;
};
