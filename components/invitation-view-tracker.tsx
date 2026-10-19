"use client";

import { useEffect } from "react";

export function InvitationViewTracker({ invitationId }: { invitationId: string }) {
  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/invitation-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId }),
      credentials: "same-origin",
      keepalive: true,
      signal: controller.signal,
    }).catch(() => undefined);

    return () => controller.abort();
  }, [invitationId]);

  return null;
}
