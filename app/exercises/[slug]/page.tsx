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
  const params = useParams<{slug:string}>();
  const [item, setItem] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState("brief");
  useEffect(() => {
    let active = true;
    setLoading(true);
    getPublishedExercises()
      .then((rows) => { if (active) setItem(rows.find((x) => x.slug === params.slug) || null); })
      .catch(() => { if (active) setItem(getExercises().find((x) => x.slug === params.slug && x.published) || null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.slug]);
  async function copy() { if (!item) return; try { await navigator.clipboard?.writeText(item.code); setCopied(true); setTimeout(()=>setCopied(false),1600); } catch { setCopied(false); } }
  function jumpTo(id: string) { setActiveStep(id); document.getElementById(`detail-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  if (loading) return <><SiteHeader/><main className="content-wrap page-main"><div className="empty-state"><h2>正在加载练习…</h2></div></main></>;
  if (!item) return <><SiteHeader/><main className="content-wrap page-main"><div className="empty-state"><h2>暂未找到这条练习</h2><p>它可能已被取消发布或删除。</p><Link href="/exercises">返回练习列表</Link></div></main></>;
  return <><SiteHeader/><main className="content-wrap detail-main">
    <div className="breadcrumb"><Link href="/home">首页</Link> / <Link href="/exercises">课堂练习</Link> / {item.title}</div>
    <div className="detail-title"><div className="eyebrow">{item.category} · PYTHON EXERCISE</div><h1>{item.title}</h1><p>{item.summary}</p><div className="detail-meta"><span>Python</span><span>{item.date}</span>{item.tags.map(t=><span key={t}>#{t}</span>)}</div><button className="button button-light" onClick={copy}>{copied ? "已复制 ✓" : "复制源代码 ↗"}</button></div>
    <nav className="detail-step-nav" aria-label="练习内容导航">
      <button className={activeStep==="brief"?"active":""} onClick={()=>jumpTo("brief")}><span>01</span>练习说明</button>
      <button className={activeStep==="source"?"active":""} onClick={()=>jumpTo("source")}><span>02</span>源代码</button>
      {item.allowRun && <button className={activeStep==="run"?"active":""} onClick={()=>jumpTo("run")}><span>03</span>在线运行</button>}
      <button className={activeStep==="review"?"active":""} onClick={()=>jumpTo("review")}><span>{item.allowRun?"04":"03"}</span>学习总结</button>
    </nav>
    <section id="detail-brief" className="detail-section"><div className="section-number">01</div><div><h2>练习说明</h2><p>{item.description}</p></div></section>
    <section id="detail-source" className="detail-section block-section"><div className="section-number">02</div><div className="detail-full"><h2>源代码 <small> / SOURCE CODE</small></h2><div className="source-code"><div className="source-top"><span>● ● ●</span><span>{item.slug}.py</span><button onClick={copy}>{copied?"已复制":"复制代码"}</button></div><pre>{item.code.split("\n").map((line,i)=><div key={i}><i>{String(i+1).padStart(2,"0")}</i>{line || " "}</div>)}</pre></div></div></section>
    {item.allowRun && <section id="detail-run" className="detail-section block-section"><div className="section-number">03</div><div className="detail-full"><h2>在线运行 <small> / ONLINE RUNNER</small></h2><PythonRunner initialCode={item.code} initialInput={item.stdin}/>{item.externalUrl && <a className="external-link" href={item.externalUrl} target="_blank" rel="noreferrer">在外部 Python 平台运行 ↗</a>}</div></section>}
    <section id="detail-review" className="detail-section"><div className="section-number">04</div><div><h2>学习总结</h2><p>{item.learning}</p></div></section>
    <div className="back-row"><Link href="/exercises" className="text-link">← 返回全部练习</Link></div>
  </main><Footer/></>;
}
