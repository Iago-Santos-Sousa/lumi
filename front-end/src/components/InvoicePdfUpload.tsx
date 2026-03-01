import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { invoiceApi } from "../integrations/invoice";
import { useToast } from "../context/ToastContext";
import { handleErrorMessage } from "../utils/errorValidation";

const MAX_FILES = 5;
const MAX_SIZE_BYTES = 40 * 1024; // 40 KB

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const InvoicePdfUpload: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [rejectionErrors, setRejectionErrors] = useState<string[]>([]);

  const { mutate: uploadInvoicePdf, isPending } = useMutation({
    mutationFn: (pdfs: File[]) => invoiceApi().uploadInvoicePdf(pdfs),
    onSuccess: (data) => {
      const { succeeded, failed } = data;

      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setFiles([]);

      if (succeeded.length > 0) {
        showToast(
          "success",
          `Upload realizado com sucesso para ${succeeded.length} arquivo(s).`,
        );
      }

      if (failed.length > 0) {
        const failedFiles = failed
          .map((f) => `${f.filename}: ${f.error}`)
          .join("; ");
        showToast(
          "error",
          `Falha ao enviar ${failed.length} arquivo(s): ${failedFiles}`,
        );
      }
    },
    onError: (error: unknown) => {
      const errorMessage = handleErrorMessage(error);
      console.error("Erro ao enviar PDF: ", error);
      showToast("error", errorMessage ?? "Erro ao enviar PDF");
    },
  });

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setRejectionErrors([]);

      const errors: string[] = [];

      if (rejected.length > 0) {
        rejected.forEach(({ file, errors: fileErrors }) => {
          fileErrors.forEach((err) => {
            if (err.code === "file-too-large") {
              errors.push(
                `"${file.name}" excede o tamanho máximo de ${formatBytes(MAX_SIZE_BYTES)}.`,
              );
            } else if (err.code === "file-invalid-type") {
              errors.push(`"${file.name}" não é um arquivo PDF válido.`);
            } else if (err.code === "too-many-files") {
              errors.push(`Máximo de ${MAX_FILES} arquivos por upload.`);
            } else {
              errors.push(`"${file.name}": ${err.message}`);
            }
          });
        });
      }

      const combined = [...files, ...accepted];
      if (combined.length > MAX_FILES) {
        errors.push(
          `Você pode selecionar no máximo ${MAX_FILES} arquivos. ${combined.length - MAX_FILES} arquivo(s) ignorado(s).`,
        );
        setFiles(combined.slice(0, MAX_FILES));
      } else {
        setFiles(combined);
      }

      setRejectionErrors([...new Set(errors)]);
    },
    [files],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_SIZE_BYTES,
    maxFiles: MAX_FILES,
    disabled: isPending,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    uploadInvoicePdf(files);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <UploadFileIcon sx={{ color: "#1AC5E2" }} />
        <Typography variant="subtitle1" fontWeight="bold">
          Upload de Faturas PDF
        </Typography>
        <Chip
          label={`máx. ${MAX_FILES} arquivos · ${formatBytes(MAX_SIZE_BYTES)} cada`}
          size="small"
          variant="outlined"
          sx={{ ml: 1, color: "text.secondary", borderColor: "grey.300" }}
        />
      </Stack>

      {/* Dropzone */}
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed",
          borderColor: isDragActive ? "#1AC5E2" : "grey.300",
          borderRadius: 2,
          p: { xs: 3, md: 4 },
          textAlign: "center",
          cursor: isPending ? "not-allowed" : "pointer",
          backgroundColor: isDragActive ? "rgba(26,197,226,0.06)" : "grey.50",
          transition: "border-color 0.2s, background-color 0.2s",
          "&:hover": {
            borderColor: isPending ? "grey.300" : "#1AC5E2",
            backgroundColor: isPending ? "grey.50" : "rgba(26,197,226,0.04)",
          },
        }}
      >
        <input {...getInputProps()} />
        <PictureAsPdfIcon
          sx={{
            fontSize: 40,
            color: isDragActive ? "#1AC5E2" : "grey.400",
            mb: 1,
          }}
        />
        {isDragActive ? (
          <Typography color="primary" fontWeight="medium">
            Solte os arquivos aqui…
          </Typography>
        ) : (
          <>
            <Typography variant="body1" fontWeight="medium">
              Arraste e solte PDFs aqui
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              ou clique para selecionar arquivos
            </Typography>
          </>
        )}
      </Box>

      {/* Erros de validação */}
      {rejectionErrors.length > 0 && (
        <Stack spacing={0.5} sx={{ mt: 2 }}>
          {rejectionErrors.map((err, i) => (
            <Alert key={i} severity="warning" sx={{ py: 0.5 }}>
              {err}
            </Alert>
          ))}
        </Stack>
      )}

      {/* Lista de arquivos selecionados */}
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {files.length} arquivo(s) selecionado(s):
          </Typography>
          <List dense disablePadding>
            {files.map((file, index) => (
              <ListItem
                key={`${file.name}-${index}`}
                disableGutters
                sx={{
                  borderRadius: 1,
                  px: 1,
                  "&:hover": { backgroundColor: "grey.50" },
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => removeFile(index)}
                    disabled={isPending}
                    aria-label="remover arquivo"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                }
              >
                <PictureAsPdfIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "#DA1FFB" }}
                />
                <ListItemText
                  primary={file.name}
                  secondary={formatBytes(file.size)}
                  slotProps={{
                    primary: { variant: "body2", noWrap: true },
                    secondary: { variant: "caption" },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Botão de envio */}
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={files.length === 0 || isPending}
          startIcon={
            isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <CheckCircleOutlineIcon />
            )
          }
          sx={{
            backgroundColor: "#1AC5E2",
            "&:hover": { backgroundColor: "#17b0cb" },
          }}
        >
          {isPending ? "Enviando…" : "Enviar Faturas"}
        </Button>
      </Stack>
    </Paper>
  );
};

export default InvoicePdfUpload;
