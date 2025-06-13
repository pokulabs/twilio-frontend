import { useState } from "react";
import {
  Button,
  Typography,
  Stack,
  Textarea,
  Checkbox,
  Grid,
  Table,
  Select,
  Option,
  Input,
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

type NewCampaignProps = {
  onComplete: () => void;
  onCancel: () => void;
};

export default function NewCampaign({
  onComplete,
  onCancel,
}: NewCampaignProps) {
  const { phoneNumbers, whatsappNumbers } = useCredentials();
  const [senderNumbers, setSenderNumbers] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [phoneNumberHeader, setPhoneNumberHeader] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [template, setTemplate] = useState(
    `Create your template here—use {{ColumnName}} to personalize each message.\n\nExample:\nHi {{FirstName}}, thanks for visiting {{Company}}!`,
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

      <Input
        placeholder="Campaign name"
        value={campaignName}
        onChange={(e) => setCampaignName(e.target.value)}
      />

      <Stack gap={1}>
        <Typography>Select number(s) to send campaign from:</Typography>
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
      </Stack>

      <Stack gap={1}>
        <Typography>Upload receipients list:</Typography>
        <CsvUploader
          onRecipients={(data) => {
            setRecipients(data);
            setHeaders(Object.keys(data[0]));
          }}
        />
      </Stack>

      <Textarea
        minRows={3}
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
      />

      <Select
        disabled={!recipients.length}
        placeholder="Select the phone number column"
        value={phoneNumberHeader}
        onChange={(_event, newPhoneNumber) =>
          setPhoneNumberHeader(newPhoneNumber!)
        }
      >
        {headers.map((e) => (
          <Option key={e} value={e}>
            {e}
          </Option>
        ))}
      </Select>

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
                  <td>{phoneNumberHeader && r[phoneNumberHeader]}</td>
                  <td>{hydrate(template, r)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      <Button
        disabled={
          !campaignName ||
          !senderNumbers.length ||
          !recipients.length ||
          !phoneNumberHeader
        }
        onClick={async () => {
          try {
            await apiClient.createCampaign(
              campaignName,
              template,
              recipients,
              senderNumbers,
              phoneNumberHeader,
            );
          } catch (err) {
            console.error("Error creating campaign:", err);
          }
          onComplete();
        }}
      >
        Send Campaign
      </Button>

      <Button onClick={onCancel} variant="outlined" color="neutral">
        Cancel
      </Button>
    </Stack>
  );
}
