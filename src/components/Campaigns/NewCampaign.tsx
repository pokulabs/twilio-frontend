import { useState } from "react";
import {
  Button,
  Typography,
  Stack,
  Textarea,
  Checkbox,
  Grid,
  Table,
} from "@mui/joy";
import { apiClient } from "../../api-client";
import { useCredentials } from "../../context/CredentialsContext";
import CsvUploader, { Recipient } from "./CsvUploader";

const hydrate = (t: string, r: Recipient) => {
  let text = t;
  for (const key in r) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
    text = text.replace(pattern, r[key]);
  }
  return text;
};

export default function NewCampaign() {
  const { phoneNumbers, whatsappNumbers } = useCredentials();
  const [senderNumbers, setSenderNumbers] = useState<string[]>([]);

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [template, setTemplate] = useState(
    "Hi {{name}}, thanks for visiting {{company}}!",
  );

  const handleCheckboxChange = (number: string) => {
    setSenderNumbers((prev) =>
      prev.includes(number)
        ? prev.filter((n) => n !== number)
        : [...prev, number],
    );
  };

  return (
    <Stack spacing={2}>
      <Typography level="h4" gutterBottom>
        New Campaign
      </Typography>

      <Typography>Send number(s):</Typography>

      <Grid container>
        {phoneNumbers.concat(whatsappNumbers).map((number) => (
          <Grid xs={6} key={number}>
            <Checkbox
              label={number}
              checked={senderNumbers.includes(number)}
              onChange={() => handleCheckboxChange(number)}
            />
          </Grid>
        ))}
      </Grid>

      <CsvUploader
        onRecipients={(data) => {
          setRecipients(data);
        }}
      />

      <Textarea
        minRows={3}
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
      />

      {recipients.length > 0 && (
        <>
          <Typography level="title-md">Preview first 5:</Typography>
          <Table>
            <thead>
              <tr>
                <th>Phone</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {recipients.slice(0, 5).map((r, i) => (
                <tr key={i}>
                  <td>{r.phone}</td>
                  <td>{hydrate(template, r)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      <Button
        disabled={!senderNumbers.length || !recipients.length}
        onClick={async () => {
          try {
            await apiClient.createCampaign(template, recipients, senderNumbers);
          } catch (err) {
            console.error("Error creating campaign:", err);
          }
        }}
      >
        Send Campaign
      </Button>
    </Stack>
  );
}
