import { useState } from "react";
import Papa from "papaparse";
import { Stack, Typography, Sheet } from "@mui/joy";
import Dropzone from "react-dropzone";
import { UploadFileRounded } from "@mui/icons-material";

export type Recipient = {
  phone: string;
  [index: string]: any;
};

type Props = {
  onRecipients: (recipients: Recipient[]) => void;
};

export default function CsvUploader(props: Props) {
  const { onRecipients } = props;
  const [error, setError] = useState("");

  const handleDrop = (files: File[]) => {
    setError("");
    const file = files[0];

    // Limit of 5mb
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Please upload a CSV under 5MB.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      complete: (result) => {
        const data = result.data as Recipient[];
        if (!data[0]?.phone) {
          setError("CSV must include a 'phone' column.");
          return;
        }

        onRecipients(data);
      },
      error: () => setError("Failed to parse CSV"),
    });
  };

  return (
    <Stack spacing={2}>
      <Dropzone
        onDrop={handleDrop}
        accept={{ "text/csv": [".csv"] }}
        multiple={false}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <Sheet
            sx={{
              p: 4,
              border: "2px dashed",
              borderColor: isDragActive
                ? "primary.solidBg"
                : "neutral.outlinedBorder",
              borderRadius: "lg",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <UploadFileRounded color="primary" />
              <Typography mt={1}>
                {isDragActive
                  ? "Drop the CSV here..."
                  : "Drag CSV here or click to upload"}
              </Typography>
              <Typography>
                Max file size: <b>5MB</b>
              </Typography>
            </div>
          </Sheet>
        )}
      </Dropzone>

      {error && <Typography color="danger">{error}</Typography>}
    </Stack>
  );
}
