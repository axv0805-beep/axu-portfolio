"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-shell">
      <main className="page-main state-page container">
        <p className="state-code">500 / ERROR</p>
        <h1 className="state-title">页面出了点问题</h1>
        <p className="state-text">可以刷新重试。如果一直出现，请稍后再来。</p>
        <div className="state-actions">
          <button className="btn btn-primary" type="button" onClick={() => reset()}>
            重试
          </button>
        </div>
      </main>
    </div>
  );
}
