"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function enterDemo() {
    setError("");
    setMessage("");
    setDemoBusy(true);
    try {
      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const raw = await response.text();
      let result: { error?: string; ok?: boolean } = {};
      if (raw) {
        try {
          result = JSON.parse(raw);
        } catch {
          throw new Error(`体验登录接口返回了非 JSON 内容（HTTP ${response.status}）。请稍后重试，或检查 Vercel 部署日志。`);
        }
      } else {
        throw new Error(`体验登录接口没有返回内容（HTTP ${response.status}）。请检查 Vercel 部署状态。`);
      }
      if (!response.ok) throw new Error(result.error || `体验登录失败（HTTP ${response.status}）`);
      if (!result.ok) throw new Error("体验登录接口未确认登录成功，请稍后重试。");
      router.replace("/home");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "体验登录失败，请稍后重试。");
    } finally {
      setDemoBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    if (mode === "signup" && password !== confirm) {
      setBusy(false);
      setError("两次输入的密码不一致。");
      return;
    }
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/home` },
        });
        if (authError) throw authError;
        if (data.session) router.replace("/home");
        else setMessage("注册成功！请查看邮箱并点击验证链接，然后登录。");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.replace("/home");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <header className="auth-topbar">
        <Link href="/login" className="auth-brand">CODE ARCHIVE<span> / PYTHON</span></Link>
        <span className="auth-top-note">A PERSONAL LEARNING SPACE</span>
      </header>
      <section className="auth-layout">
        <div className="auth-intro">
          <div className="auth-eyebrow"><i /> YOUR WORK, YOUR PROGRESS</div>
          <h1>让每一次<br />练习都有<span>迹可循。</span></h1>
          <p>一个持续生长的 Python 学习档案。<br />整理代码，记录思考，也展示每一步进步。</p>
          <div className="auth-intro-meta"><span>01 / LEARN</span><span>02 / BUILD</span><span>03 / ARCHIVE</span></div>
        </div>
        <div className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-card-kicker">{mode === "signin" ? "WELCOME BACK" : "GET STARTED"}</span>
            <h2>{mode === "signin" ? "登录你的档案" : "创建学习账号"}</h2>
            <p>{mode === "signin" ? "输入账号信息，继续你的学习记录。" : "注册个人账号，开启代码收藏之旅。"}</p>
          </div>
          <form onSubmit={submit} className="auth-form">
            <label>邮箱地址
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </label>
            <label>密码
              <input type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 6 位字符" />
            </label>
            {mode === "signup" && <label>确认密码
              <input type="password" required minLength={6} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="再次输入密码" />
            </label>}
            {error && <div className="auth-alert auth-error" role="alert">{error}</div>}
            {message && <div className="auth-alert auth-success" role="status">{message}</div>}
            <button className="auth-submit" disabled={busy}>{busy ? "请稍候…" : mode === "signin" ? "登录" : "创建账号"} <span>↗</span></button>
          </form>
          <div className="auth-switch">
            {mode === "signin" ? "还没有账号？" : "已经拥有账号？"}
            <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}>
              {mode === "signin" ? "立即注册" : "返回登录"}
            </button>
          </div>
          {mode === "signin" && (
            <div className="auth-demo">
              <div><strong>教师 / 访客体验</strong><span>无需注册，直接进入体验环境。</span></div>
              <button type="button" onClick={enterDemo} disabled={demoBusy}>{demoBusy ? "正在进入…" : "进入体验账号 ↗"}</button>
            </div>
          )}
          <div className="auth-card-foot"><span>SECURE SIGN IN</span><span>© CODE ARCHIVE 2026</span></div>
        </div>
      </section>
    </main>
  );
}
