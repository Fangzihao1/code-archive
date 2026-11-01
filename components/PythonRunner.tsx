"use client";
import { useEffect, useRef, useState } from "react";

type Result = { stdout: string; stderr: string; ok: boolean; elapsed?: number };

export default function PythonRunner({ initialCode, initialInput }: { initialCode: string; initialInput: string }) {
  const [code, setCode] = useState(initialCode);
  const [stdin, setStdin] = useState(initialInput);
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState("等待运行");
  const [busy, setBusy] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function run() {
    if (busy) return;
    workerRef.current?.terminate();
    if (timerRef.current) clearTimeout(timerRef.current);
    const worker = new Worker("/python-worker.js");
    workerRef.current = worker;
    setBusy(true);
    setResult(null);
    setStatus("正在加载 Python 运行环境…");
    const started = performance.now();

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === "ready") {
        setStatus("正在运行代码…");
        timerRef.current = setTimeout(() => {
          worker.terminate();
          workerRef.current = null;
          setResult({ stdout: "", stderr: "程序运行超过 5 秒，已终止本次运行。", ok: false });
          setStatus("执行超时");
          setBusy(false);
        }, 5000);
        worker.postMessage({ type: "run", code, stdin });
      } else if (data.type === "result") {
        setResult({ ...data.result, elapsed: Math.round(performance.now() - started) });
        setStatus(data.result.ok ? "运行完成" : "运行出现错误");
        setBusy(false);
        worker.terminate();
        workerRef.current = null;
        if (timerRef.current) clearTimeout(timerRef.current);
      } else if (data.type === "error") {
        setResult({ stdout: "", stderr: data.message || "运行环境加载失败", ok: false });
        setStatus("运行失败");
        setBusy(false);
        worker.terminate();
        workerRef.current = null;
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    };
    worker.onerror = () => {
      setResult({ stdout: "", stderr: "运行器发生错误，请刷新页面后重试。", ok: false });
      setStatus("运行失败");
      setBusy(false);
      worker.terminate();
      workerRef.current = null;
    };
    worker.postMessage({ type: "init" });
  }

  async function copyCode() {
    await navigator.clipboard?.writeText(code);
    setStatus("代码已复制");
  }

  return <section className="runner">
    <div className="runner-head"><div><span className="eyebrow">PYTHON PLAYGROUND</span><h3>在线运行代码</h3></div><span className="runtime-pill">Pyodide · Browser</span></div>
    <label className="field-label">代码编辑区</label>
    <textarea className="code-editor" spellCheck={false} value={code} onChange={e => setCode(e.target.value)} />
    <div className="runner-grid">
      <div>
        <label className="field-label">输入数据（每行对应一次 input）</label>
        <textarea className="input-editor" value={stdin} onChange={e => setStdin(e.target.value)} placeholder="输入程序所需数据，每行一项" />
      </div>
      <div>
        <label className="field-label">运行状态</label>
        <div className="status-box"><span className={busy ? "pulse-dot" : "status-dot"} />{status}</div>
        <div className="runner-actions">
          <button className="button button-primary" onClick={run} disabled={busy}>{busy ? "运行中…" : "▶ 运行代码"}</button>
          <button className="button button-light" onClick={() => { setCode(initialCode); setStdin(initialInput); setResult(null); setStatus("已重置"); }}>重置</button>
          <button className="button button-light" onClick={copyCode}>复制代码</button>
        </div>
      </div>
    </div>
    <div className="output-head"><label className="field-label">运行输出</label>{result?.elapsed !== undefined && <small>约 {result.elapsed} ms</small>}</div>
    <pre className="output-box">{result ? [result.stdout, result.stderr ? `错误信息：\n${result.stderr}` : ""].filter(Boolean).join("\n") || "程序运行完成，没有输出。" : "运行结果将在这里显示。"}</pre>
    <p className="runner-note">首次运行需要加载 Python 环境，请保持网络连接。此运行器适合基础练习，不支持所有依赖本机系统的第三方库。</p>
  </section>;
}
