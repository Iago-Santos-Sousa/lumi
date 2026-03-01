import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import BoltIcon from "@mui/icons-material/Bolt";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SavingsIcon from "@mui/icons-material/Savings";
import SummaryCard from "../../components/SummaryCard";

import {
  formatNumberToCurrency,
  formatNumberToInteger,
} from "../../utils/otherUtils";

import DashboardCharts from "../../components/DashboardCharts";
import InvoicePdfUpload from "../../components/InvoicePdfUpload";
import { useDashboard } from "../../hooks/useDashboard";

const Dashboard: React.FC = () => {
  const {
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
  } = useDashboard();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const hasData = data && data.chart.length > 0;

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>

      {/* Upload de Faturas */}
      <InvoicePdfUpload />

      {/* Filtros */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Filtros
        </Typography>
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

      {/* Erro */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar os dados do dashboard. Tente novamente mais tarde.
        </Alert>
      )}

      {/* Cards de totais */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        flexWrap="wrap"
        sx={{ mb: 4 }}
        useFlexGap
      >
        <SummaryCard
          icon={<BoltIcon />}
          title="Consumo Total de Energia"
          value={
            data
              ? `${formatNumberToInteger(data.totals.consumo_energia_eletrica_kwh)} kWh`
              : "—"
          }
          color="#1AC5E2"
          isLoading={isLoading}
        />
        <SummaryCard
          icon={<EnergySavingsLeafIcon />}
          title="Energia Compensada (GD)"
          value={
            data
              ? `${formatNumberToInteger(data.totals.energia_compensada_kwh)} kWh`
              : "—"
          }
          color="#6087EA"
          isLoading={isLoading}
        />
        <SummaryCard
          icon={<AttachMoneyIcon />}
          title="Valor Total sem GD"
          value={
            data
              ? `R$ ${formatNumberToCurrency(data.totals.valor_total_sem_gd).replace("R$", "")}`
              : "—"
          }
          color="#DA1FFB"
          isLoading={isLoading}
        />
        <SummaryCard
          icon={<SavingsIcon />}
          title="Economia GD"
          value={
            data
              ? `R$ ${formatNumberToCurrency(data.totals.economia_gd).replace("R$", "")}`
              : "—"
          }
          color="#50C6D8"
          isLoading={isLoading}
        />
      </Stack>

      <Divider sx={{ mb: 4 }} />

      {/* Gráficos */}
      {isLoading && (
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={400} />
        </Stack>
      )}

      {!isLoading && hasData && <DashboardCharts data={data} />}

      {!isLoading && !isError && !hasData && (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            color: "text.secondary",
          }}
        >
          <Typography variant="h6">Nenhum dado encontrado.</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Tente ajustar os filtros ou verifique se há faturas cadastradas.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
