import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import DescriptionIcon from "@mui/icons-material/Description";

import { IClient } from "../types/clients";
import { IInvoice } from "../types/invoice";

import { useInvoiceLibrary } from "../hooks/useInvoiceLibrary";

interface MonthEntry {
  code: string; // e.g. "JAN"
  label: string; // e.g. "Jan"
}

const MONTHS: MonthEntry[] = [
  { code: "JAN", label: "Jan" },
  { code: "FEV", label: "Fev" },
  { code: "MAR", label: "Mar" },
  { code: "ABR", label: "Abr" },
  { code: "MAI", label: "Mai" },
  { code: "JUN", label: "Jun" },
  { code: "JUL", label: "Jul" },
  { code: "AGO", label: "Ago" },
  { code: "SET", label: "Set" },
  { code: "OUT", label: "Out" },
  { code: "NOV", label: "Nov" },
  { code: "DEZ", label: "Dez" },
];

function getInvoiceForMonth(
  invoices: IInvoice[],
  monthCode: string,
): IInvoice | undefined {
  return invoices.find((inv) => {
    const month = inv.reference_month?.split("/")[0]?.toUpperCase();
    return month === monthCode;
  });
}

interface InvoiceTableProps {
  clients: IClient[];
  isLoading: boolean;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ clients, isLoading }) => {
  const { downloadPdf } = useInvoiceLibrary();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table size="small" aria-label="tabela de faturas">
        <TableHead>
          <TableRow sx={{ backgroundColor: "primary.main" }}>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", whiteSpace: "nowrap" }}
            >
              Nº Cliente
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", whiteSpace: "nowrap" }}
            >
              Nº UC
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", whiteSpace: "nowrap" }}
            >
              Distribuidora
            </TableCell>
            {MONTHS.map((m) => (
              <TableCell
                key={m.code}
                align="center"
                sx={{ color: "white", fontWeight: "bold", px: 1 }}
              >
                {m.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={15}
                align="center"
                sx={{ py: 4, color: "text.secondary" }}
              >
                Nenhuma fatura encontrada.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow
                key={client.id}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{client.client_number}</TableCell>
                <TableCell>
                  {client.invoices[0]?.installation_number ?? "—"}
                </TableCell>
                <TableCell>CEMIG</TableCell>
                {MONTHS.map((m) => {
                  const invoice = getInvoiceForMonth(client.invoices, m.code);
                  const hasPdf = !!invoice?.pdf_path;

                  return (
                    <TableCell key={m.code} align="center" sx={{ px: 1 }}>
                      <Tooltip
                        title={
                          hasPdf
                            ? `Fatura ${m.label}: ${invoice!.reference_month}`
                            : invoice
                              ? "PDF não disponível"
                              : "Sem fatura"
                        }
                        arrow
                      >
                        <span>
                          <DescriptionIcon
                            fontSize="small"
                            color={hasPdf ? "primary" : "disabled"}
                            sx={{
                              cursor: hasPdf ? "pointer" : "default",
                              opacity: hasPdf ? 1 : 0.3,
                            }}
                            onClick={() => {
                              if (hasPdf) {
                                downloadPdf(
                                  client.client_number,
                                  invoice!.reference_month,
                                );
                              }
                            }}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvoiceTable;
