"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import PythonRunner from "@/components/PythonRunner";
import { getExercises } from "@/lib/storage";
import { getPublishedExercises } from "@/lib/exercises-cloud";
import type { Exercise } from "@/lib/types";

export default function ExerciseDetailPage() {
  const params = useParams<{ slug: string }>();
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState("brief");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPublishedExercises()
      .then((rows) => { if (active) setItems(rows); })
      .catch(() => { if (active) setItems(getExercises().filter((x) => x.published)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const item = items.find((x) => x.slug === params.slug) ?? null;
  const currentIndex = items.findIndex((x) => x.slug === params.slug);
  const previous = currentIndex > 0 ? items[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : null;
  const related = item
    ? items.filter((x) => x.id !== item.id && (x.category === item.category || x.tags.some((tag) => item.tags.includes(tag)))).slice(0, 3)
    : [];

  useEffect(() => {
    if (!item) return;
    const sections = ["brief", "source", ...(item.allowRun ? ["run"] : []), "review"]
      .map((id) => document.getElementById(`detail-${id}`))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveStep(visible.target.id.replace("detail-", ""));
    }, { rootMargin: "-18% 0px -62% 0px", threshold: [0, .2, .5, .8] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [item]);

  async function copy() {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function downloadSource() {
    if (!item) return;
    const blob = new Blob([item.code], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${item.slug || "python-exercise"}.py`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function jumpTo(id: string) {
    setActiveStep(id);
    document.getElementById(`detail-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) return <><SiteHeader /><main className="content-wrap page-main"><div className="detail-loading"><span className="loading-dot" /><p>正在整理练习内容…</p></div></main><Footer /></>;
  if (!item) return <><SiteHeader /><main className="content-wrap page-main"><div className="empty-state"><h2>暂未找到这条练习</h2><p>它可能已被取消发布或删除。</p><Link href="/exercises" className="button button-light">返回练习列表</Link></div></main><Footer /></>;

  const steps = [
    { id: "brief", number: "01", label: "练习说明" },
    { id: "source", number: "02", label: "源代码" },
    ...(item.allowRun ? [{ id: "run", number: "03", label: "在线运行" }] : []),
    { id: "review", number: item.allowRun ? "04" : "03", label: "学习总结" },
  ];

  return <><SiteHeader /><main className="content-wrap detail-main">
    <div className="breadcrumb"><Link href="/home">首页</Link><span>/</span><Link href="/exercises">课堂练习</Link><span>/</span><span>{item.title}</span></div>
    <header className="detail-title">
      <div className="detail-title-top"><span className="eyebrow">{item.category} · PYTHON EXERCISE</span><span className="detail-index">EXERCISE {String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span></div>
      <h1>{item.title}</h1><p>{item.summary}</p>
      <div className="detail-meta"><span>Python</span><span>{item.date}</span>{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
      <div className="detail-title-actions">
        <button className="button button-light" onClick={copy}>{copied ? "已复制 ✓" : "复制完整源代码 ↗"}</button>
        <button className="button button-light" onClick={downloadSource}>下载 .py ↓</button>
      </div>
    </header>

    <nav className="detail-step-nav" aria-label="练习内容导航">
      {steps.map((step) => <button key={step.id} className={activeStep === step.id ? "active" : ""} onClick={() => jumpTo(step.id)} aria-current={activeStep === step.id ? "location" : undefined}><span>{step.number}</span>{step.label}</button>)}
    </nav>

    <section id="detail-brief" className="detail-section detail-intro-section">
      <div className="section-number">01</div><div className="detail-full">
        <div className="detail-section-kicker">ABOUT THIS EXERCISE</div><h2>练习说明</h2>
        <p>{item.description || item.summary || "通过本次练习熟悉 Python 的基本语法与编程思路。"}</p>
        <div className="detail-learning-card"><span>本次练习关注</span><strong>{item.category}</strong><p>{item.tags.length ? item.tags.map((tag) => `#${tag}`).join("　") : "从理解问题开始，逐步完成代码实践。"}</p></div>
      </div>
    </section>

    <section id="detail-source" className="detail-section block-section">
      <div className="section-number">02</div><div className="detail-full">
        <div className="detail-section-kicker">SOURCE CODE</div><h2>源代码</h2>
        <div className="source-code"><div className="source-top"><span className="source-window-dots">● ● ●</span><span>{item.slug}.py</span><div className="source-actions"><button onClick={copy}>{copied ? "已复制 ✓" : "复制代码"}</button><button onClick={downloadSource}>下载 .py ↓</button></div></div>
          <pre>{item.code.split("\n").map((line, index) => <div key={index}><i>{String(index + 1).padStart(2, "0")}</i><span>{line || " "}</span></div>)}</pre>
        </div>
        <p className="detail-code-note">建议先阅读代码，再尝试运行并观察输出结果。</p>
      </div>
    </section>

    {item.allowRun && <section id="detail-run" className="detail-section block-section">
      <div className="section-number">03</div><div className="detail-full">
        <div className="detail-section-kicker">TRY IT YOURSELF</div><h2>在线运行</h2>
        <PythonRunner initialCode={item.code} initialInput={item.stdin} />
        {item.externalUrl && <a className="external-link" href={item.externalUrl} target="_blank" rel="noreferrer">在外部 Python 平台运行 ↗</a>}
      </div>
    </section>}

    <section id="detail-review" className="detail-section">
      <div className="section-number">{item.allowRun ? "04" : "03"}</div><div className="detail-full">
        <div className="detail-section-kicker">WHAT YOU LEARN</div><h2>学习总结</h2>
        <p>{item.learning || "完成本次练习后，可以回顾代码的执行过程，并尝试调整条件或数据，观察程序结果的变化。"}</p>
      </div>
    </section>

    {(previous || next) && <nav className="detail-pagination" aria-label="切换练习">
      {previous ? <Link href={`/exercises/${previous.slug}`} className="detail-page-link"><small>← PREVIOUS</small><strong>{previous.title}</strong><span>上一条练习</span></Link> : <span />}
      {next ? <Link href={`/exercises/${next.slug}`} className="detail-page-link next"><small>NEXT →</small><strong>{next.title}</strong><span>下一条练习</span></Link> : <span />}
    </nav>}

    {related.length > 0 && <section className="detail-related"><div><span className="detail-section-kicker">KEEP EXPLORING</span><h2>继续探索</h2></div><div className="detail-related-grid">{related.map((entry) => <Link href={`/exercises/${entry.slug}`} key={entry.id}><span>{entry.category}</span><strong>{entry.title}</strong><small>查看练习 ↗</small></Link>)}</div></section>}
    <div className="back-row"><Link href="/exercises" className="text-link">← 返回全部练习</Link></div>
  </main><Footer /></>;
}
