import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import { Box, Button, IconButton, Input, Typography } from "@mui/joy";
import { useTwilio } from "../../context/TwilioProvider";

export default function Whatsapp() {
  const { whatsappNumbers, setWhatsappNumbers } = useTwilio();

  const handleAddInput = () => {
    setWhatsappNumbers([...whatsappNumbers, ""]);
  };

  const handleRemoveInput = (index: number) => {
    const updated = whatsappNumbers.filter((_, i) => i !== index);
    const nonEmpty = updated.filter((val) => val.trim() !== "");
    setWhatsappNumbers(nonEmpty.length > 0 ? updated : []);
  };

  const handleInputChange = (index: number, value: string) => {
    // If there's only one input and it's cleared out, treat it as empty array
    if (whatsappNumbers.length === 1 && value.trim() === "") {
      setWhatsappNumbers([]);
      return;
    }

    const newNumbers = [...whatsappNumbers];
    newNumbers[index] = value;
    setWhatsappNumbers(newNumbers);
  };

  const inputsToRender = whatsappNumbers.length > 0 ? whatsappNumbers : [""];

  return (
    <Box>
      <Typography level="title-md">Twilio WhatsApp</Typography>
      <Typography level="body-sm" sx={{ mb: 2 }}>
        Using Twilio WhatsApp numbers? Add them below.
      </Typography>

      {inputsToRender.map((number, index) => (
        <Box
          key={index}
          sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}
        >
          <Input
            value={number}
            onChange={(e) => handleInputChange(index, e.target.value)}
            sx={{ flexGrow: 1 }}
            placeholder="Ex: whatsapp:+12223334444"
          />
          <IconButton
            onClick={() => handleRemoveInput(index)}
            color="danger"
            disabled={inputsToRender.length === 1}
          >
            <RemoveCircleOutline />
          </IconButton>
        </Box>
      ))}
      <Button
        onClick={handleAddInput}
        color="primary"
        startDecorator={<AddCircleOutline />}
        disabled={inputsToRender.at(-1)?.trim() === ""}
      >
        Add Another Number
      </Button>
    </Box>
  );
}
