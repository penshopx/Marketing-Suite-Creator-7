import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function PWAInstallBanner() {
  const { canInstall, isInstalling, install, isInstalled } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("pwa-banner-dismissed") === "true";
    if (wasDismissed) setDismissed(true);
  }, []);

  useEffect(() => {
    if (canInstall && !dismissed && !isInstalled) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [canInstall, dismissed, isInstalled]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  const handleInstall = async () => {
    await install();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800 rounded-2xl shadow-2xl p-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
            Install Marketing Tools AI
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
            Tambah ke home screen HP kamu
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            className="h-8 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            onClick={handleInstall}
            disabled={isInstalling}
            data-testid="button-pwa-banner-install"
          >
            <Download className="h-3 w-3 mr-1" />
            {isInstalling ? "..." : "Install"}
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            data-testid="button-pwa-banner-dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
