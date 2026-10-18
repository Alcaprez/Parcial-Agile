"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function ReintentarBtn() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button className="btn" disabled={pending} onClick={() => start(() => router.refresh())}>
      {pending ? "Reintentando…" : "Reintentar"}
    </button>
  );
}
