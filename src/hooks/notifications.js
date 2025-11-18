"use client";

import { useEffect, useCallback } from "react";
import {
  requestNotificationPermission,
  setupForegroundMessageListener,
} from "@/services/notificationService";

export const useNotifications = (onMessageReceived) => {
  const initializeNotifications = useCallback(async () => {
    // Wait for component to mount (client-side only)
    if (typeof window === "undefined") return;

    // Small delay to ensure everything is loaded
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Request permission and register
    await requestNotificationPermission();

    // Setup foreground listener
    setupForegroundMessageListener((payload) => {
      console.log("New notification in hook:", payload);
      if (onMessageReceived) {
        onMessageReceived(payload);
      }
    });
  }, [onMessageReceived]);

  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);
};
