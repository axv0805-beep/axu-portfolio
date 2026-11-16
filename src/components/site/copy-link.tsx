"use client";

import { useState } from "react";

export function CopyLink() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="meta-share" type="button" onClick={copy}>
      {copied ? "链接已复制" : "复制链接"} <span aria-hidden="true">↗</span>
    </button>
  );
}
