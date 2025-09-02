import { Typography, Stack, Table, Button, IconButton } from "@mui/joy";
import { displayDate, displayDateTime } from "../../utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { apiClient } from "../../api-client";
import { DownloadRounded } from "@mui/icons-material";

// Register only what we need
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function CampaignsTable({ campaigns }: { campaigns: any[] }) {
  // Aggregate data by day
  const dailyData: Record<string, { failed: number; delivered: number }> = {};
  campaigns.forEach((c) => {
    const date = displayDate(new Date(c.createdTime));
    if (!dailyData[date]) {
      dailyData[date] = { failed: 0, delivered: 0 };
    }
    dailyData[date].failed += +c.failedMessages || 0;
    dailyData[date].delivered += +c.deliveredMessages || 0;
  });

  const labels = Object.keys(dailyData).sort();
  const failedData = labels.map((d) => dailyData[d].failed);
  const deliveredData = labels.map((d) => dailyData[d].delivered);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Failed Messages",
        data: failedData,
        borderColor: "red",
        backgroundColor: "rgba(255,0,0,0.3)",
        tension: 0.2,
      },
      {
        label: "Delivered Messages",
        data: deliveredData,
        borderColor: "green",
        backgroundColor: "rgba(0,128,0,0.3)",
        tension: 0.2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Messages per Day" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <Stack spacing={2}>
      <Typography level="h4">Campaigns</Typography>

      <Line data={chartData} options={chartOptions} />

      {campaigns.length > 0 && (
        <Table>
          <thead>
            <tr>
              <th>Created</th>
              <th>Name</th>
              <th>Status</th>
              <th>Queued</th>
              <th>Pending</th>
              <th>Failed</th>
              <th>Delivered</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((r) => (
              <tr key={r.id}>
                <td>{displayDateTime(new Date(r.createdTime))}</td>
                <td>{r.name}</td>
                <td>{r.status}</td>
                <td>
                  {r.queuedMessages}/{r.messageCount}
                </td>
                <td>
                  {r.pendingMessages}/{r.messageCount}
                </td>
                <td>
                  {r.failedMessages}/{r.messageCount}
                </td>
                <td>
                  {r.deliveredMessages}/{r.messageCount}
                </td>
                <td>
                {(() => {
                  const createdDate = new Date(r.createdTime);
                  const numDays = 7;
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - numDays);

                  if (createdDate >= sevenDaysAgo) {
                    return (
                      <IconButton
                        variant="outlined"
                        size="sm"
                        onClick={() => {
                          apiClient.downloadCampaignMessagesCsv(r.id);
                        }}
                      >
                        <DownloadRounded />
                      </IconButton>
                    );
                  }
                  return `>${numDays} days old`;
                })()}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Stack>
  );
}
