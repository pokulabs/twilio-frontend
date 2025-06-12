import { useState } from "react";
import Papa from "papaparse";
import { Stack, Typography, Sheet, IconButton, Box } from "@mui/joy";
import Dropzone from "react-dropzone";
import { UploadFileRounded } from "@mui/icons-material";

export type Recipient = {
  [index: string]: any;
};

type Props = {
  onRecipients: (recipients: Recipient[]) => void;
};

export default function CsvUploader(props: Props) {
  const { onRecipients } = props;
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const parseCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      complete: (result) => {
        const data = result.data as Recipient[];
        onRecipients(data);
      },
      error: () => setError("Failed to parse CSV"),
    });
  };

  const handleDrop = (files: File[]) => {
    setError("");
    const file = files[0];

    // Limit of 5mb
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Please upload a CSV under 5MB.");
      return;
    }

    setFileName(file.name); // Set file name
    parseCsv(file);
  };

  return (
    <Stack spacing={2}>
      <Dropzone
        onDrop={handleDrop}
        accept={{ "text/csv": [".csv"] }}
        multiple={false}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <Sheet>
            <div {...getRootProps()}>
              <Box
                sx={{
                  cursor: "pointer",
                  padding: 3,
                  border: "2px dashed",
                  borderColor: isDragActive
                    ? "primary.solidBg"
                    : "neutral.outlinedBorder",
                  borderRadius: "lg",
                  textAlign: "center",
                }}
              >
                <input {...getInputProps()} />
                <IconButton>
                  <UploadFileRounded color="primary" />
                </IconButton>
                <Typography mt={1}>
                  {isDragActive
                    ? "Drop the CSV here..."
                    : "Drag CSV here or click to upload"}
                </Typography>
                <Typography color="neutral" fontSize={14}>
                  Up to 5MB
                </Typography>
                {fileName && (
                  <Typography mt={1} fontSize={14} color="primary">
                    Uploaded: {fileName}
                  </Typography>
                )}
              </Box>
            </div>
          </Sheet>
        )}
      </Dropzone>

      {error && <Typography color="danger">{error}</Typography>}
    </Stack>
  );
}
