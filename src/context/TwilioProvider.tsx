import React, { createContext, useContext, useState, ReactNode } from "react";

import TwilioClient from "../twilio-client";
import { EventEmitter } from "../event-emitter";
import { storage } from "../storage";

import type { WebhooksActivationStatus } from "../types";

interface CredentialsContextType {
  sid: string;
  authToken: string;
  twilioClient: TwilioClient | null;
  eventEmitter: EventEmitter | null;
  setCredentials: (sid: string, authToken: string) => Promise<boolean>;
  isAuthenticated: boolean;
  activePhoneNumber: string;
  phoneNumbers: string[];
  setActivePhoneNumber: React.Dispatch<React.SetStateAction<string>>;
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

const CredentialsContext = createContext<CredentialsContextType | null>(null);

export const useTwilio = () => {
  const ctx = useContext(CredentialsContext);
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

export const CredentialsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sid, setSid] = useState(storage.get("sid"));
  const [authToken, setAuthToken] = useState(storage.get("authToken"));
  const [twilioClient, setTwilioClient] = useState<TwilioClient | null>(null);
  const [eventEmitter, setEventEmitter] = useState<EventEmitter | null>(null);
  const [activePhoneNumber, setActivePhoneNumber] = useState("");
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

  const setCredentials = async (sid: string, authToken: string) => {
    let isSuccess = false;
    if (!sid || !authToken) return isSuccess;
    setIsLoading(true);
    try {
      setSid(sid);
      setAuthToken(authToken);
      const client = await TwilioClient.getInstance(sid, authToken);
      const numbers = await client.getPhoneNumbers();
      const ee = await EventEmitter.getInstance(client.axiosInstance);
      setEventEmitter(ee);
      setTwilioClient(client);
      setPhoneNumbers(numbers);
      setActivePhoneNumber(numbers[0]);
      setIsAuthenticated(true);
      isSuccess = true;
      // Only save credentials in storage after validity check
      storage.setCredentials(sid, authToken);
    } catch (err) {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
    return isSuccess;
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
    <CredentialsContext.Provider
      value={{
        sid,
        authToken,
        twilioClient,
        eventEmitter,
        setCredentials,
        isAuthenticated,
        activePhoneNumber,
        phoneNumbers,
        setActivePhoneNumber,
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
    </CredentialsContext.Provider>
  );
};
