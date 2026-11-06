"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { getExercises } from "@/lib/storage";
import type { Exercise } from "@/lib/types";

export default function GalleryPage() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [category, setCategory] = useState("全部片段");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setItems(getExercises().filter(item => item.published));
  }, []);

  const categories = useMemo(() => ["全部片段", ...Array.from(new Set(items.map(item => item.category)))], [items]);
  const filtered = useMemo(() => items.filter(item => {
    const matchCategory = category === "全部片段" || item.category === category;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || `${item.title} ${item.summary} ${item.code} ${item.tags.join(" ")}`.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  }), [items, category, query]);

  async function copyCode(item: Exercise) {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopied(item.id);
      window.setTimeout(() => setCopied(current => current === item.id ? null : current), 1500);
    } catch {
      setCopied(null);
    }
  }

  return <><SiteHeader/><main className="content-wrap page-main gallery-main">
    <div className="page-intro">
      <div className="eyebrow">CODE GALLERY / LIVE COLLECTION</div>
      <h1>代码图库<span>.</span></h1>
      <p>从已发布的课堂练习中，快速浏览代码片段、筛选知识点，并进入完整练习。</p>
    </div>
    <div className="gallery-toolbar">
      <label className="gallery-search"><span>⌕</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索代码、练习名称或知识点…" aria-label="搜索代码片段"/></label>
      <div className="gallery-view-toggle" aria-label="切换展示方式">
        <button className={layout==="grid"?"active":""} onClick={()=>setLayout("grid")} aria-pressed={layout==="grid"}>▦ 网格</button>
        <button className={layout==="list"?"active":""} onClick={()=>setLayout("list")} aria-pressed={layout==="list"}>☷ 列表</button>
      </div>
    </div>
    <div className="gallery-filter-row">{categories.map(item=><button key={item} className={category===item?"active":""} onClick={()=>setCategory(item)}>{item}</button>)}</div>
    <div className="gallery-result-line"><span>当前展示 <strong>{filtered.length}</strong> 个代码片段</span><button onClick={()=>{setQuery("");setCategory("全部片段");}}>重置筛选 ×</button></div>
    {filtered.length ? <div className={layout==="grid"?"code-gallery-grid":"code-gallery-list"}>
      {filtered.map((item,index)=><article className="code-gallery-card" key={item.id}>
        <div className="code-gallery-top"><span><i></i><i></i><i></i></span><small>{item.category} / {String(index+1).padStart(2,"0")}</small><button onClick={()=>copyCode(item)}>{copied===item.id?"已复制 ✓":"复制代码 ↗"}</button></div>
        <div className="code-gallery-info"><span className="eyebrow">{item.category} · PYTHON</span><h2>{item.title}</h2><p>{item.summary}</p></div>
        <pre className="gallery-code-preview">{item.code.split("\n").slice(0,7).map((line,lineIndex)=><span key={lineIndex}><i>{String(lineIndex+1).padStart(2,"0")}</i>{line || " "}</span>)}{item.code.split("\n").length>7 && <em>… 更多代码</em>}</pre>
        <div className="code-gallery-bottom"><div>{item.tags.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div><Link href={`/exercises/${item.slug}`}>查看完整练习 <b>↗</b></Link></div>
      </article>)}
    </div> : <div className="empty-state"><strong>暂时没有匹配的代码片段</strong><p>换一个关键词，或重置分类继续浏览。</p><button className="button button-light" onClick={()=>{setQuery("");setCategory("全部片段");}}>重置筛选</button></div>}
    {!items.length && <p className="gallery-note">图库内容会根据后台已发布的练习自动更新；目前还没有可展示的已发布练习。</p>}
  </main><Footer/></>;
}
