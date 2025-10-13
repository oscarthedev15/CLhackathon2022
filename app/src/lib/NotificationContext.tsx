"use client";

import { createContext, useContext } from "react";

interface NotificationContextType {
  showNotification: (
    message: string,
    severity: "info" | "success" | "error"
  ) => void;
  refreshBets: () => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  refreshBets: () => {},
});

export const useNotificationContext = () => useContext(NotificationContext);
