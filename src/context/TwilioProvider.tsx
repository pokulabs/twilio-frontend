import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import TwilioClient from "../twilio-client";
import { EventEmitter } from "../event-emitter";
import { storage } from "../storage";

import type { WebhooksActivationStatus } from "../types";
import { useAuth } from "../hooks/use-auth";
import { apiClient } from "../api-client";

interface TwilioContextType {
  sid: string | null;
  authToken: string | null;
  twilioClient: TwilioClient | null;
  eventEmitter: EventEmitter | null;
  setCredentials: (sid: string, authToken: string) => Promise<void>;
  isAuthenticated: boolean;
  phoneNumbers: string[];
  isLoading: boolean;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  webhooksActivationStatus: WebhooksActivationStatus;
  setWebhooksActivationStatus: (
    key: keyof WebhooksActivationStatus,
    value: boolean,
  ) => void;
  whatsappNumbers: string[];
  setWhatsappNumbers: (numbers: string[]) => void;
}

const TwilioContext = createContext<TwilioContextType | null>(null);

export const useTwilio = () => {
  const ctx = useContext(TwilioContext);
  if (!ctx)
    throw new Error("useCredentials must be used within CredentialsProvider");
  return ctx;
};

export const useAuthedTwilio = () => {
  const ctx = useTwilio();

  if (
    !ctx.isAuthenticated ||
    !ctx.twilioClient ||
    !ctx.eventEmitter ||
    ctx.isLoading
  ) {
    throw new Error("useAuthedCreds used before auth is ready");
  }

  return {
    ...ctx,
    twilioClient: ctx.twilioClient,
    eventEmitter: ctx.eventEmitter,
  };
};

export const TwilioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated: isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [sid, setSid] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [twilioClient, setTwilioClient] = useState<TwilioClient | null>(null);
  const [eventEmitter, setEventEmitter] = useState<EventEmitter | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(
    storage.get("mainStore").webhookUrl,
  );
  const [webhooksActivationStatus, setWebhooksActivationStatus] = useState(
    storage.get("mainStore").webhooksActivationStatus,
  );
  const [whatsappNumbers, setWhatsappNumbers] = useState(
    storage.get("mainStore").whatsappNumbers,
  );

  // On mount, decide where to get creds
  useEffect(() => {
    const init = async () => {
      if (isAuthLoading) {
        return;
      }

      if (isLoggedIn) {
        // Clear local storage creds
        storage.setCredentials("", "");
        const creds = await apiClient.getTwilioCreds();
        if (creds.data) {
          await setCredentials(creds.data.id, creds.data.key, {
            skipPersist: true,
          });
        }
      } else {
        const sid = storage.get("sid");
        const authToken = storage.get("authToken");
        await setCredentials(sid, authToken, { skipPersist: true });
      }
    };
    init();
  }, [isLoggedIn, isAuthLoading]);

  const setCredentials = async (
    sid: string | null,
    authToken: string | null,
    { skipPersist = false } = {},
  ) => {
    if (!sid || !authToken) {
      return;
    }
    setIsLoading(true);
    if (!skipPersist) {
      if (isLoggedIn) {
        await apiClient.createTwilioKey(sid, authToken);
      } else {
        storage.setCredentials(sid, authToken);
      }
    }
    try {
      setSid(sid);
      setAuthToken(authToken);
      const client = await TwilioClient.getInstance(sid, authToken);
      const numbers = await client.getPhoneNumbers();
      const ee = await EventEmitter.getInstance(client.axiosInstance);

      setEventEmitter(ee);
      setTwilioClient(client);
      setPhoneNumbers(numbers);
      setIsAuthenticated(true);
    } catch (err) {
      setEventEmitter(null);
      setTwilioClient(null);
      setPhoneNumbers([]);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const setActivatedWebhooksContext = (
    key: keyof WebhooksActivationStatus,
    value: boolean,
  ) => {
    setWebhooksActivationStatus((prev) => ({
      ...prev,
      [key]: value,
    }));
    storage.setWebhooksActivationStatus(key, value);
  };

  const setWebhookUrlContext = (url: string) => {
    setWebhookUrl(url);
    storage.setWebhookUrl(url);
  };

  const setWhatsappNumbersContext = (numbers: string[]) => {
    setWhatsappNumbers(numbers);
    storage.setWhatsappNumbers(numbers);
  };

  return (
    <TwilioContext.Provider
      value={{
        sid,
        authToken,
        twilioClient,
        eventEmitter,
        setCredentials,
        isAuthenticated,
        phoneNumbers,
        isLoading,
        setWebhookUrl: setWebhookUrlContext,
        webhookUrl,
        setWebhooksActivationStatus: setActivatedWebhooksContext,
        webhooksActivationStatus,
        whatsappNumbers,
        setWhatsappNumbers: setWhatsappNumbersContext,
      }}
    >
      {children}
    </TwilioContext.Provider>
  );
};
