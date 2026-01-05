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
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 ${currentMessage.modalOverlayClassName || ""}`}
          onClick={() => handleClose(currentMessage)}
        />

        {/* Modal */}
        <div
          className={`relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800 ${currentMessage.className || ""}`}
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
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirm(currentMessage)}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
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
