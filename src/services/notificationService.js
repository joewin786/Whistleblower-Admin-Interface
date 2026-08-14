import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    // Check if messaging is available
    if (!messaging) {
      console.log("Firebase messaging not available");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("✅ Notification permission granted");

      // Register service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          { scope: "/" }
        );
        console.log("✅ Service Worker registered:", registration);
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.ready,
      });

      if (token) {
        console.log("✅ FCM Token obtained:", token);
        await registerDeviceWithBackend(token);
        return token;
      } else {
        console.log("❌ No FCM token available");
        return null;
      }
    } else if (permission === "denied") {
      console.log("❌ Notification permission denied");
      return null;
    } else {
      console.log("⚠️ Notification permission dismissed");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
};

// Register device with backend
const registerDeviceWithBackend = async (fcmToken) => {
  try {
    const token = localStorage.getItem("token"); // Your JWT token

    if (!token) {
      console.log("No auth token found");
      return;
    }

    const response = await fetch(`${API_URL}/api/devices/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fcm_token: fcmToken,
        device_type: "web",
        device_name: `${navigator.platform} - ${navigator.userAgent
          .split(" ")
          .slice(-2)
          .join(" ")}`,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Device registered with backend:", data);
    } else {
      console.error("❌ Failed to register device:", response.statusText);
    }
  } catch (error) {
    console.error("Error registering device with backend:", error);
  }
};

// Setup foreground message listener
export const setupForegroundMessageListener = (callback) => {
  if (!messaging) {
    console.log("Messaging not available for foreground listener");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("📬 Foreground message received:", payload);

    // Call custom callback
    if (callback) {
      callback(payload);
    }

    // Show browser notification even when app is in foreground
    if (Notification.permission === "granted") {
      const { title, body } = payload.notification || {};

      if (title) {
        const notification = new Notification(title, {
          body: body || "",
          icon: "/icon.png",
          badge: "/badge.png",
          data: payload.data,
          tag: payload.data?.report_id || "default",
        });

        notification.onclick = () => {
          window.focus();
          if (payload.data?.report_id) {
            window.location.href = `/admin/reports/${payload.data.report_id}`;
          }
          notification.close();
        };
      }
    }
  });
};

// Unregister device
export const unregisterDevice = async (fcmToken) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/devices/unregister`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fcm_token: fcmToken,
      }),
    });

    if (response.ok) {
      console.log("✅ Device unregistered");
    }
  } catch (error) {
    console.error("Error unregistering device:", error);
  }
};

// Test notification
export const sendTestNotification = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/notifications/test-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "🔔 Test Notification",
        message: "This is a test push notification from admin panel",
        data: {
          test: "true",
          timestamp: Date.now().toString(),
        },
      }),
    });

    if (response.ok) {
      console.log("✅ Test notification sent");
      return true;
    }
  } catch (error) {
    console.error("Error sending test notification:", error);
  }
  return false;
};
