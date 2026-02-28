import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import InvoiceTable from "../../components/InvoiceTable";
import InvoicePagination from "../../components/InvoicePagination";
import { useInvoiceLibrary } from "../../hooks/useInvoiceLibrary";

const InvoiceLibrary: React.FC = () => {
  const {
    clientNumberInput,
    initialDate,
    finalDate,
    data,
    isLoading,
    isError,
    page,
    setClientNumberInput,
    setInitialDate,
    setFinalDate,
    handleSearch,
    handleClear,
    handlePageChange,
  } = useInvoiceLibrary();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Biblioteca de Faturas
      </Typography>

      {/* Filtros */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          flexWrap="wrap"
        >
          <TextField
            label="Nº do Cliente"
            variant="outlined"
            size="small"
            value={clientNumberInput}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d+$/.test(value)) {
                setClientNumberInput(value);
              }
            }}
            onKeyDown={handleKeyDown}
            slotProps={{
              input: "numeric",
            }}
            sx={{ minWidth: 160 }}
          />

          <DatePicker
            label="Data inicial"
            value={initialDate}
            onChange={(newValue) => setInitialDate(newValue)}
            format="DD/MM/YYYY"
            maxDate={finalDate ?? undefined}
            slotProps={{
              textField: { size: "small", sx: { minWidth: 170 } },
            }}
          />

          <DatePicker
            label="Data final"
            value={finalDate}
            onChange={(newValue) => setFinalDate(newValue)}
            format="DD/MM/YYYY"
            minDate={initialDate ?? undefined}
            slotProps={{
              textField: { size: "small", sx: { minWidth: 170 } },
            }}
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              size="medium"
            >
              Buscar
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              size="medium"
              color="inherit"
            >
              Limpar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar as faturas. Tente novamente mais tarde.
        </Alert>
      )}

      <InvoiceTable clients={data?.results ?? []} isLoading={isLoading} />

      <InvoicePagination
        page={page}
        pageTotal={data?.pageTotal ?? 0}
        onChange={handlePageChange}
      />
    </Box>
  );
};

export default InvoiceLibrary;
