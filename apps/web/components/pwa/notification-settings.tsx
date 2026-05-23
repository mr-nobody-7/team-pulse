"use client";

import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <p className="text-sm text-muted-foreground">
        Push notifications are not supported in your browser.
      </p>
    );
  }

  if (permission === "denied") {
    return (
      <p className="text-sm text-muted-foreground">
        Notifications are blocked. Enable them in your browser settings.
      </p>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">Leave notifications</p>
        <p className="text-xs text-muted-foreground">
          {isSubscribed
            ? "You'll be notified when leaves are approved or need your review."
            : "Get notified instantly when leaves are approved or need your review."}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isSubscribed
              ? "bg-[--tf-mint-bg] text-[--tf-mint]"
              : "bg-[--tf-surface-3] text-[--tf-text-3]"
          }`}
        >
          {isSubscribed ? "On" : "Off"}
        </span>
        <button
          type="button"
          disabled={isLoading}
          onClick={isSubscribed ? unsubscribe : subscribe}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            isSubscribed ? "bg-[--tf-iris]" : "bg-[--tf-surface-3]"
          }`}
          role="switch"
          aria-checked={isSubscribed}
          aria-label="Toggle leave notifications"
        >
          <span
            className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${
              isSubscribed ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
