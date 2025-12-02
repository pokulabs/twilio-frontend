import {
  Box,
  Link,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import HumanAsATool from "./HumanAsATool";
import TryIt from "./TryIt";
import Steps from "./Steps";
import InteractionsLog from "./InteractionsLog";
import ActiveInteractions from "./ActiveInteractions";

function Hitl() {
  const [value, setValue] = useState(1);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Box
        sx={{
          position: "sticky",
          top: { sm: -100, md: -110 },
          bgcolor: "background.paper",
          pt: 8,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            bgcolor: "transparent",
            pl: { md: 4 },
            minHeight: 0,
            "& .MuiTab-root": {
              fontWeight: 600,
              minWidth: "auto",
              minHeight: 0,
              color: "text.secondary",
              borderRadius: "6px 6px 0 0",
              py: 1,
              "&:hover": {
                bgcolor: "grey.100",
                color: "text.primary"
              },
              "&.Mui-selected": {
                bgcolor: "transparent",
                color: "text.primary",
              },
            },
            "& .MuiTabs-indicator": {
              height: 2,
              bgcolor: "primary.main",
            },
          }}
        >
          <Tab sx={{textTransform: "none"}} label="Try it" />
          <Tab sx={{textTransform: "none"}} label="Configure" />
          <Tab sx={{textTransform: "none"}} label="Instructions" />
          <Tab sx={{textTransform: "none"}} label="Active Interactions"/>
          <Tab sx={{textTransform: "none"}} label="Log" />
        </Tabs>

        <Box sx={{ p: 2, borderTop: 1, borderColor: "grey.300" }}>
          <Typography variant="body2" color="text.secondary">
            Enable your AI agent to loop in a human for help. Works with any
            agent that can use MCP.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Learn more{" "}
            <Link
              href="https://www.pokulabs.com/guides/poku-human-in-the-loop-tools"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </Link>
            .
          </Typography>

          {value === 0 && <TryIt />}
          {value === 1 && <HumanAsATool />}
          {value === 2 && <Steps />}
          {value === 3 && <ActiveInteractions />}
          {value === 4 && <InteractionsLog />}
        </Box>
      </Box>
    </Box>
  );
}

export default Hitl;