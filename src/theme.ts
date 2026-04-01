import { alpha, createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
    shape: {
        borderRadius: 6,
    },
    palette: {
        mode: "light",
        primary: {
            main: "#0B6BCB",
            light: "#4B9FFF",
            dark: "#0A5CAD",
            contrastText: "#FFFFFF",
        },
        background: {
            default: "#F7F9FC",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#1F2937",
            secondary: "#4B5563",
        },
        divider: "#E5EAF2",
    },
    typography: {
        fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        body1: {
            fontSize: "0.92rem",
        },
        body2: {
            fontSize: "0.84rem",
        },
        h6: {
            fontWeight: 700,
            letterSpacing: "-0.01em",
        },
        button: {
            textTransform: "none",
            fontWeight: 600,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#F7F9FC",
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    borderColor: "#E3E8EF",
                    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderColor: "#E3E8EF",
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    paddingInline: 14,
                },
                containedPrimary: {
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "none",
                        backgroundColor: "#0A5CAD",
                    },
                },
                outlined: {
                    borderColor: "#CDD7E1",
                    "&:hover": {
                        borderColor: "#9FA6B2",
                    },
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: "small",
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: "#FFFFFF",
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#CDD7E1",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#9FA6B2",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#0B6BCB",
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    paddingTop: 1,
                    paddingBottom: 1,
                    borderRadius: 6,
                    "&.Mui-selected": {
                        backgroundColor: alpha("#757575", 0.14),
                        color: "#0e0e0e",
                        "&:hover": {
                            backgroundColor: alpha("#757575", 0.18),
                        },
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: "#E5EAF2",
                },
            },
        },
    },
});
