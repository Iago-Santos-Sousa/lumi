import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

type RefreshTokenResponse = {
  status: string;
  accessToken: string;
  refreshToken: string;
};

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Adicione um interceptor de requisição
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken: string | null = sessionStorage.getItem("user.accessToken");
  const pathUrlValue: string = window.location.pathname;

  if (accessToken && !pathUrlValue.includes("/reset-password")) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  async function (error: AxiosError) {
    const originalRequest: InternalAxiosRequestConfig | undefined =
      error.config;

    if (error.response?.status === 403) {
      const refreshToken: string | null =
        sessionStorage.getItem("user.refreshToken");

      if (refreshToken) {
        try {
          // Requisição para gerar um novo accessToken
          const response = await api.post<RefreshTokenResponse>(
            "/refresh-token",
            {
              refreshToken,
            },
          );

          // Coloca o novo accessToken e refreshToken no localStorage
          sessionStorage.setItem("user.accessToken", response.data.accessToken);
          sessionStorage.setItem(
            "user.refreshToken",
            response.data.refreshToken,
          );

          if (originalRequest) {
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return api(originalRequest);
          } else {
            throw new Error("Error in refresh-token requisition!");
          }
        } catch (error: unknown | AxiosError) {
          console.log(error);
          sessionStorage.clear();
          window.location.replace("/");
        }
      } else {
        sessionStorage.clear();
        window.location.replace("/");
      }
    }

    // Redirecionar para a tela de login caso o accessToken não seja mais válido
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
      sessionStorage.clear();
    }
    return Promise.reject(error);
  },
);

export default api;
