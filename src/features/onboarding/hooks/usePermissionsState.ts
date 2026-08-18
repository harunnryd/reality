import { useState, useEffect, useCallback } from "react";
import { permissionsService, type PermissionsSnapshot } from "@/services/permissionsService";

export function usePermissionsState() {
  const [permissions, setPermissions] = useState<PermissionsSnapshot>({
    microphone: "not_determined",
    screen_recording: "not_determined",
    accessibility: "not_determined",
  });
  const [isRequesting, setIsRequesting] = useState(false);

  const refreshPermissions = useCallback(async () => {
    const snapshot = await permissionsService.checkPermissions();
    setPermissions(snapshot);
    return snapshot;
  }, []);

  useEffect(() => {
    void refreshPermissions();

    const onFocus = () => {
      void refreshPermissions();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshPermissions]);

  const requestMicrophone = useCallback(async () => {
    setIsRequesting(true);
    try {
      const status = await permissionsService.requestMicrophone();
      setPermissions((prev) => ({ ...prev, microphone: status }));
    } finally {
      setIsRequesting(false);
      void refreshPermissions();
    }
  }, [refreshPermissions]);

  const requestScreenRecording = useCallback(async () => {
    setIsRequesting(true);
    try {
      const status = await permissionsService.requestScreenRecording();
      setPermissions((prev) => ({ ...prev, screen_recording: status }));
    } finally {
      setIsRequesting(false);
      void refreshPermissions();
    }
  }, [refreshPermissions]);

  const openScreenSettings = useCallback(async () => {
    await permissionsService.openScreenRecordingSettings();
  }, []);

  const openAccessibilitySettings = useCallback(async () => {
    await permissionsService.openAccessibilitySettings();
  }, []);

  const allGranted = permissions.microphone === "granted" && permissions.screen_recording === "granted";

  return {
    permissions,
    isRequesting,
    allGranted,
    requestMicrophone,
    requestScreenRecording,
    openScreenSettings,
    openAccessibilitySettings,
    refreshPermissions,
  };
}
