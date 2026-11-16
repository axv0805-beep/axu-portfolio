"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ next, showDemo }: { next: string; showDemo: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json()) as { ok: boolean; error?: { message: string } };
      if (!response.ok || !payload.ok) {
        setError(payload.error?.message ?? "登录失败，请重试。");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("网络连接失败，请重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-card" onSubmit={submit}>
      <h1>登录</h1>
      <p className="sub">管理作品、分类与站点信息。</p>

      <div className="field">
        <label className="label" htmlFor="username">
          用户名
        </label>
        <input
          className="input"
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="password">
          密码
        </label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {error ? (
        <p className="field-error" role="alert" style={{ marginTop: 14 }}>
          {error}
        </p>
      ) : null}

      <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 22 }}>
        {loading ? "登录中…" : "进入后台"}
      </button>

      {showDemo ? (
        <div className="login-hint">
          演示账号 / admin
          <br />
          演示密码 / liubai-2026
        </div>
      ) : null}
    </form>
  );
}
