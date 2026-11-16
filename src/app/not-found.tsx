import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <main className="page-main state-page container">
        <p className="state-code">404 / NOT FOUND</p>
        <h1 className="state-title">这一页是留白</h1>
        <p className="state-text">链接可能已经失效，或者作品被移走了。</p>
        <div className="state-actions">
          <Link className="btn btn-primary" href="/">
            回到首页 <span className="arrow">→</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
