"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallbackHref?: string;
  label?: string;
};

export default function BackButton({ fallbackHref = "/home", label = "返回上一页" }: BackButtonProps) {
  const router = useRouter();

  function goBack() {
    const hasSameOriginReferrer = typeof document !== "undefined"
      && document.referrer
      && new URL(document.referrer).origin === window.location.origin;
    if (hasSameOriginReferrer && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button type="button" className="page-back-button" onClick={goBack}>
      <span aria-hidden="true">←</span>{label}
    </button>
  );
}
