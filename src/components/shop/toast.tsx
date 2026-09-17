"use client";

import Link from "next/link";

export interface ToastMessage {
  text: string;
  action?: { label: string; href: string };
}

export function Toast({
  message,
  onClose,
}: {
  message: ToastMessage | null;
  onClose: () => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 lg:bottom-6"
    >
      {message && (
        <div className="pointer-events-auto flex items-center gap-4 rounded-full bg-brand-800 py-3 pl-5 pr-3 text-sm text-surface-elevated shadow-float">
          <span>{message.text}</span>
          {message.action && (
            <Link
              href={message.action.href}
              onClick={onClose}
              className="rounded-full bg-surface-elevated px-3 py-1 font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              {message.action.label}
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="grid size-7 place-items-center rounded-full text-lg leading-none text-surface-elevated/70 transition hover:bg-brand-700 hover:text-surface-elevated"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
