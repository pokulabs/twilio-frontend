import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";
import DecisionAgent from "./Agent";
import LlmKey from "./LlmKey";
import withLoggedIn from "../../context/withLoggedIn";

function Flagging() {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    apiClient
      .checkLlmKeyExists()
      .then((res) => {
        setIsSaved(!!res.data?.key);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <LlmKey isSaved={isSaved} setIsSaved={setIsSaved} />
      <DecisionAgent hasLlmKey={isSaved} />
    </>
  );
}

export default withLoggedIn(Flagging);