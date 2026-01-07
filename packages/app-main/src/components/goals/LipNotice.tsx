"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconInfoCircle,
  IconLoader2,
} from "@tabler/icons-react";

type NoticeType = "success" | "warning" | "error" | "info" | "loading";

interface LipNoticeProps {
  type: NoticeType;
  message: string;
  show: boolean;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

const NOTICE_STYLES: Record<NoticeType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-700 dark:text-green-400",
    icon: <IconCheck className="h-5 w-5" />,
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: <IconAlertTriangle className="h-5 w-5" />,
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-700 dark:text-red-400",
    icon: <IconX className="h-5 w-5" />,
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: <IconInfoCircle className="h-5 w-5" />,
  },
  loading: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    icon: <IconLoader2 className="h-5 w-5 animate-spin" />,
  },
};

export function LipNotice({
  type,
  message,
  show,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
  className,
}: LipNoticeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (show) {
      setIsLeaving(false);
      // Small delay to trigger animation
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsLeaving(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsLeaving(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  useEffect(() => {
    if (show && autoHide && type !== "loading") {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [show, autoHide, autoHideDelay, type, onDismiss]);

  if (!isVisible && !show) return null;

  const styles = NOTICE_STYLES[type];

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-out",
        isLeaving ? "max-h-0 opacity-0" : "max-h-24 opacity-100",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border p-3 mt-2",
          "transform transition-transform duration-300",
          isLeaving ? "-translate-y-2" : "translate-y-0",
          styles.bg,
          styles.border
        )}
      >
        <span className={styles.text}>{styles.icon}</span>
        <p className={cn("flex-1 text-sm", styles.text)}>{message}</p>
        {onDismiss && type !== "loading" && (
          <button
            onClick={onDismiss}
            className={cn(
              "rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10",
              "transition-colors duration-200",
              styles.text
            )}
          >
            <IconX className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Hook for managing notice state
export function useLipNotice() {
  const [notice, setNotice] = useState<{
    type: NoticeType;
    message: string;
    show: boolean;
  }>({
    type: "info",
    message: "",
    show: false,
  });

  const showNotice = (type: NoticeType, message: string) => {
    setNotice({ type, message, show: true });
  };

  const hideNotice = () => {
    setNotice((prev) => ({ ...prev, show: false }));
  };

  return {
    notice,
    showNotice,
    hideNotice,
    showSuccess: (message: string) => showNotice("success", message),
    showWarning: (message: string) => showNotice("warning", message),
    showError: (message: string) => showNotice("error", message),
    showInfo: (message: string) => showNotice("info", message),
    showLoading: (message: string) => showNotice("loading", message),
  };
}
