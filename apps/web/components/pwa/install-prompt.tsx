"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (localStorage.getItem("pwa-install-dismissed") === "true") {
      setDismissed(true);
      return;
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!promptRef.current) return;
    await promptRef.current.prompt();
    const { outcome } = await promptRef.current.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setDismissed(true);
    setCanInstall(false);
  };

  if (isInstalled || !canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-sm px-4 sm:bottom-4 sm:left-auto sm:right-4 sm:mx-0 sm:max-w-xs">
      <div className="flex items-center gap-3 rounded-xl border border-[--tf-border] bg-[--tf-surface-2] p-3 shadow-lg">
        <Image
          src="/mark-192.svg"
          alt="TeamFore"
          width={36}
          height={36}
          className="shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Install TeamFore</p>
          <p className="text-xs text-[--tf-text-3]">
            Add to homescreen for quick access
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-lg bg-[--tf-iris] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
          >
            Install
          </button>
          <button
            type="button"
            aria-label="Dismiss install prompt"
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-[--tf-text-3] hover:bg-[--tf-surface-3] hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
