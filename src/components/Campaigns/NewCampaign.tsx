import { useState } from "react";
import {
  Button,
  Typography,
  Stack,
  Textarea,
  Table,
  Select,
  Option,
  Input,
  Box,
  Autocomplete,
} from "@mui/joy";
import { apiClient } from "../../api-client";
import { useTwilio } from "../../context/TwilioProvider";
import CsvUploader, { Recipient } from "./CsvUploader";
import withTwilio from "../../context/withTwilio";

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

function NewCampaign({
  onComplete,
  onCancel,
}: NewCampaignProps) {
  const { phoneNumbers, whatsappNumbers } = useTwilio();
  const [senderNumbers, setSenderNumbers] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [phoneNumberHeader, setPhoneNumberHeader] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [template, setTemplate] = useState(
    `Create your template here—use {{ColumnName}} to personalize each message.\n\nExample:\nHi {{FirstName}}, thanks for visiting {{Company}}!`,
  );

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

      <Autocomplete
        value={senderNumbers}
        onChange={(event, newValue) => setSenderNumbers(newValue)}
        multiple
        disableCloseOnSelect
        options={phoneNumbers.concat(whatsappNumbers)}
        placeholder="Select number(s) to send campaign from"
      />

      <Stack gap={1}>
        <Box>
          <Typography>Upload receipients list:</Typography>
          <Typography level="body-sm">
            File must include phone numbers with format: +12223334444:
          </Typography>
        </Box>
        <CsvUploader
          onRecipients={(data, likelyPhoneNumberHeader) => {
            setRecipients(data);
            setHeaders(Object.keys(data[0]));
            if (likelyPhoneNumberHeader) {
              setPhoneNumberHeader(likelyPhoneNumberHeader);
            }
          }}
        />
      </Stack>

      <Stack gap={1}>
        <Typography>Create message template:</Typography>
        <Textarea
          minRows={3}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
      </Stack>

      <Stack gap={1}>
        <Typography>
          Select the recipient <b>phone number</b> header:
        </Typography>
        <Select
          disabled={!recipients.length}
          placeholder="Select header"
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
      </Stack>

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

export default withTwilio(NewCampaign);
