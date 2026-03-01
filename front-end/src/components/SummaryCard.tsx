import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  isLoading: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  value,
  color,
  isLoading,
}) => {
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          flex: 1,
          minWidth: 200,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.100",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#fff",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" lineHeight={1.2}>
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton width={100} height={28} />
          ) : (
            <Typography variant="h6" fontWeight="bold" lineHeight={1.4}>
              {value}
            </Typography>
          )}
        </Box>
      </Paper>
    </>
  );
};

export default SummaryCard;
