import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

interface InvoicePaginationProps {
  page: number;
  pageTotal: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const InvoicePagination: React.FC<InvoicePaginationProps> = ({
  page,
  pageTotal,
  onChange,
}) => {
  return (
    <Stack spacing={2} direction="row" justifyContent="center" sx={{ mt: 3 }}>
      <Pagination
        count={pageTotal}
        page={page}
        onChange={onChange}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
      />
    </Stack>
  );
};

export default InvoicePagination;
