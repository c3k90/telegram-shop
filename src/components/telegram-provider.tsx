"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import {
  backButton,
  closingBehavior,
  init,
  miniApp,
  swipeBehavior,
  themeParams,
  viewport,
} from "@telegram-apps/sdk-react";
import { mockDevEnvironment } from "@/lib/telegram/mock-env";

export function TelegramProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await mockDevEnvironment();
        init();

        if (miniApp.mount.isAvailable()) {
          await miniApp.mount();
        }
        if (themeParams.mount.isAvailable()) {
          themeParams.mount();
          themeParams.bindCssVars.ifAvailable();
        }
        if (viewport.mount.isAvailable()) {
          await viewport.mount();
          viewport.bindCssVars.ifAvailable();
          viewport.expand.ifAvailable();
        }
        if (backButton.mount.isAvailable()) backButton.mount();
        if (closingBehavior.mount.isAvailable()) {
          closingBehavior.mount();
          closingBehavior.enableConfirmation.ifAvailable();
        }
        if (swipeBehavior.mount.isAvailable()) {
          swipeBehavior.mount();
          swipeBehavior.disableVertical.ifAvailable();
        }

        miniApp.ready.ifAvailable();
        if (!cancelled) setReady(true);
      } catch (err) {
        // Outside Telegram the SDK can throw after a failed mock. Still show the shop.
        console.warn("Telegram SDK init failed; loading shop without native chrome.", err);
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-sm text-muted-foreground">
        Loading shop…
      </div>
    );
  }

  return <>{children}</>;
}
