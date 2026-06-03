"use client";

import { X } from "lucide-react";
import { Button } from "./button";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061A3A]/45 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold">{title}</h2>
          <Button aria-label="Close modal" size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[78vh] overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}
