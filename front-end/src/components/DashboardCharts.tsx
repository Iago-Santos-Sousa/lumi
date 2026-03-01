import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { IInvoiceDashboardData } from "../types/invoice";

import {
  formatNumberToInteger,
  formatNumberToCurrency,
} from "../utils/otherUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
);

interface DashboardChartsProps {
  data: IInvoiceDashboardData;
}

const BAR_RADIUS = 5;

const energyOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: { font: { size: 13 } },
    },
    title: {
      display: true,
      text: "Energia Elétrica (kWh)",
      font: { size: 16, weight: "bold" },
      padding: { bottom: 16 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) =>
          ` ${ctx.dataset.label}: ${formatNumberToInteger(ctx.parsed.y ?? 0)} kWh`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: "kWh", font: { size: 12 } },
      ticks: {
        callback: (value) => `${formatNumberToInteger(Number(value))} kWh`,
      },
    },
  },
};

const financialOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: { font: { size: 13 } },
    },
    title: {
      display: true,
      text: "Valores Financeiros (R$)",
      font: { size: 16, weight: "bold" },
      padding: { bottom: 16 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) =>
          ` ${ctx.dataset.label}: R$ ${formatNumberToCurrency(ctx.parsed.y ?? 0).replace("R$", "")}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: "R$", font: { size: 12 } },
      ticks: {
        callback: (value) =>
          `R$ ${formatNumberToCurrency(Number(value)).replace("R$", "")}`,
      },
    },
  },
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data }) => {
  const labels = data.chart.map((item) => item.reference_month);

  const energyChartData = {
    labels,
    datasets: [
      {
        label: "Consumo de Energia Elétrica",
        data: data.chart.map((item) => item.consumo_energia_eletrica_kwh),
        backgroundColor: "rgba(26, 197, 226, 0.75)",
        borderColor: "rgba(26, 197, 226, 1)",
        borderWidth: 1,
        borderRadius: BAR_RADIUS,
      },
      {
        label: "Energia Compensada (GD)",
        data: data.chart.map((item) => item.energia_compensada_kwh),
        backgroundColor: "rgba(96, 135, 234, 0.75)",
        borderColor: "rgba(96, 135, 234, 1)",
        borderWidth: 1,
        borderRadius: BAR_RADIUS,
      },
    ],
  };

  const financialChartData = {
    labels,
    datasets: [
      {
        label: "Valor Total sem GD",
        data: data.chart.map((item) => item.valor_total_sem_gd),
        backgroundColor: "rgba(218, 31, 251, 0.75)",
        borderColor: "rgba(218, 31, 251, 1)",
        borderWidth: 1,
        borderRadius: BAR_RADIUS,
      },
      {
        label: "Economia GD",
        data: data.chart.map((item) => item.economia_gd),
        backgroundColor: "rgba(80, 198, 216, 0.75)",
        borderColor: "rgba(80, 198, 216, 1)",
        borderWidth: 1,
        borderRadius: BAR_RADIUS,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div style={{ height: 360 }}>
          <Bar data={energyChartData} options={energyOptions} />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div style={{ height: 360 }}>
          <Bar data={financialChartData} options={financialOptions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
