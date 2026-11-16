"use client";

import { useState } from "react";

type Props = {
  text: string;
  model?: string;
  negative?: string;
  params?: Record<string, string | number>;
  collapsed?: boolean;
};

export function PromptBlock({ text, model, negative, params, collapsed = true }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <details className="prompt-block" open={!collapsed}>
      <summary>
        <span className="prompt-label">PROMPT</span>
        <span className="prompt-model">{model || "生成提示词"}</span>
        <span className="prompt-toggle" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="prompt-body">
        <pre>{text}</pre>
        {negative ? (
          <p className="prompt-negative">
            <span>NEGATIVE</span>
            {negative}
          </p>
        ) : null}
        {params && Object.keys(params).length > 0 ? (
          <dl className="prompt-params">
            {Object.entries(params).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <button className="btn btn-ghost prompt-copy" type="button" onClick={copy}>
          {copied ? "已复制" : "复制提示词"}
        </button>
      </div>
    </details>
  );
}
