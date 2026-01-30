"use client";

import React, { forwardRef } from "react";
import { useModalStore, ModalMessage } from "@/lib/stores/modalStore";
import { useCurrentUser } from "@/components/providers/currentUserProvider";

interface PopupModalWrapperProps {
  className?: string;
}

export const PopupModalWrapper = forwardRef<HTMLDivElement, PopupModalWrapperProps>(
  ({ className }, ref) => {
    const {
      modalOpen,
      modalMessages,
      setModalOpen,
      removeModalMessage,
      setTriggerUIEvent,
    } = useModalStore();

    const { userData: userObj } = useCurrentUser();

    const handleClose = (message: ModalMessage) => {
      if (message.onCloseOnDismiss) {
        removeModalMessage(message.title);
      }
      if (modalMessages.length <= 1) {
        setModalOpen(false);
      }
    };

    const handleConfirm = (message: ModalMessage) => {
      if (message.onConfirm) {
        setTriggerUIEvent({ type: message.onConfirm });
      }
      removeModalMessage(message.title);
    };

    // Get the current modal message to display
    const currentMessage = modalMessages[modalMessages.length - 1];

    if (!modalOpen || !currentMessage) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={`fixed inset-0 z-50 flex items-center justify-center ${className || ""}`}
      >
        {/* Overlay with blur */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm ${currentMessage.modalOverlayClassName || ""}`}
          onClick={() => handleClose(currentMessage)}
        />

        {/* Modal with glass effect */}
        <div
          className={`relative z-10 w-full max-w-md rounded-2xl p-6 shadow-2xl ${currentMessage.className || ""} bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/30`}
        >
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {currentMessage.title}
            </h2>
            {currentMessage.desc && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {currentMessage.desc}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="mb-6">
            {currentMessage.jsx && (
              <div className="text-slate-700 dark:text-slate-300">
                {/* JSX content would be rendered here based on the jsx key */}
                {/* You can add a jsxMapping prop or handle specific jsx types */}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => handleClose(currentMessage)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 backdrop-blur-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirm(currentMessage)}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }
);

PopupModalWrapper.displayName = "PopupModalWrapper";
