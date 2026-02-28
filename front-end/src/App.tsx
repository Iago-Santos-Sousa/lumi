import AllRoutes from "./routes";
import { AppProvider } from "./context/AppProvider";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/pt-br";

const queryClient = new QueryClient();

function App(): JSX.Element {
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <ToastProvider>
              <AllRoutes />
              <ToastContainer />
            </ToastProvider>
          </AppProvider>
        </QueryClientProvider>
      </LocalizationProvider>
    </>
  );
}

export default App;
