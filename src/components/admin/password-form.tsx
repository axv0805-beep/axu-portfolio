"use client";

import { useState } from "react";

export function PasswordForm({ username, displayName }: { username: string; displayName: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    if (newPassword.length < 8) {
      setError("新密码至少 8 位。");
      return;
    }
    if (newPassword !== confirm) {
      setError("两次输入的新密码不一致。");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: { message: string; fields?: Record<string, string> };
      };
      if (!response.ok || !payload.ok) {
        setError(payload.error?.message ?? "修改失败");
        setFieldErrors(payload.error?.fields ?? {});
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      window.alert("密码已更新。其他设备上的登录会失效。");
    } catch {
      setError("网络错误，请重试。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-content">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">账号安全</h1>
          <p className="admin-sub">单管理员账号。修改密码后，其他设备需要重新登录。</p>
        </div>
      </div>

      <div className="editor-layout">
        <form className="editor-panel" onSubmit={save}>
          <h3>登录信息</h3>
          <div className="form-grid">
            <div className="field">
              <label className="label">用户名</label>
              <input className="input input-mono" value={username} disabled />
            </div>
            <div className="field">
              <label className="label">显示名</label>
              <input className="input" value={displayName} disabled />
            </div>
          </div>

          <div className="field" style={{ marginTop: 20 }}>
            <label className="label" htmlFor="current-password">
              当前密码
            </label>
            <input
              className="input"
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.currentPassword)}
              required
            />
            {fieldErrors.currentPassword ? <p className="field-error">{fieldErrors.currentPassword}</p> : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="new-password">
              新密码 <span className="hint">至少 8 位</span>
            </label>
            <input
              className="input"
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="confirm-password">
              再次输入新密码
            </label>
            <input
              className="input"
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
            />
          </div>

          {error ? <p className="field-error" style={{ marginTop: 16 }} role="alert">{error}</p> : null}

          <div className="form-actions">
            <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
              {saving ? "修改中…" : "修改密码"}
            </button>
          </div>
        </form>

        <aside className="editor-side">
          <section className="editor-panel">
            <h3>建议</h3>
            <p className="field-help" style={{ lineHeight: 1.9 }}>
              使用 12 位以上、包含大小写与数字的密码。
              <br />
              不要把密码写进代码或提交到仓库。
              <br />
              如果忘记密码，可在服务器运行重置脚本。
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
