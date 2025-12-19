import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { Box } from "@mui/joy";
import spec from "../../assets/openapi.json";

export default function ApiDocs() {
  return (
    <Box
      component="main"
      className="MainContent"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100dvh",
        overflow: "auto",
        "& .swagger-ui .topbar": {
          display: "none",
        },
      }}
    >
      <SwaggerUI defaultModelExpandDepth={4} spec={spec} />
    </Box>
  );
}
