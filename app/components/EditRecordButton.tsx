"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AmortizationRecord } from "../data/amortization";
import { updateRecord, UpdateRecordInput } from "../actions/records";
import EditRecordModal from "./EditRecordModal";

type Props = {
  part: AmortizationRecord;
  lockedCategory?: "CUSTOMER" | "VENDOR" | null;
};

export default function EditRecordButton({ part, lockedCategory }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(updates: UpdateRecordInput) {
    setError(null);
    startTransition(async () => {
      try {
        await updateRecord(part.id, updates);
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
      >
        <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
        </svg>
        Edit
      </button>

      {open && (
        <EditRecordModal
          part={part}
          onClose={() => { setOpen(false); setError(null); }}
          onSubmit={handleSubmit}
          saving={isPending}
          error={error}
          lockedCategory={lockedCategory}
        />
      )}
    </>
  );
}
