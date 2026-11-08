"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { getExercises } from "@/lib/storage";
import { getPublishedExercises } from "@/lib/exercises-cloud";
import type { Exercise } from "@/lib/types";

export default function GalleryPage() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("全部片段");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "title" | "category">("newest");
  const [previewItem, setPreviewItem] = useState<Exercise | null>(null);

  useEffect(() => {
    let active = true;
    getPublishedExercises()
      .then((rows) => { if (active) setItems(rows); })
      .catch(() => { if (active) setItems(getExercises().filter((item) => item.published && !item.archived)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!previewItem) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setPreviewItem(null); };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [previewItem]);

  const categories = useMemo(() => ["全部片段", ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const filtered = useMemo(() => items.filter((item) => {
    const matchesCategory = category === "全部片段" || item.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${item.title} ${item.summary} ${item.code} ${item.tags.join(" ")}`.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  }), [items, category, query]);
  const sortedItems = useMemo(() => [...filtered].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title, "zh-CN");
    if (sortBy === "category") return a.category.localeCompare(b.category, "zh-CN") || a.title.localeCompare(b.title, "zh-CN");
    return b.date.localeCompare(a.date);
  }), [filtered, sortBy]);

  async function copyCode(item: Exercise) {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopied(item.id);
      window.setTimeout(() => setCopied((current) => current === item.id ? null : current), 1500);
    } catch {
      setCopied(null);
    }
  }

  return <><SiteHeader /><main className="content-wrap page-main gallery-main page-simple-background">
    <div className="page-intro"><div className="eyebrow">CODE GALLERY / LIVE COLLECTION</div><h1>代码图库<span>.</span></h1><p>从已发布的课堂练习中，浏览代码片段、筛选知识点，并进入完整练习。</p></div>
    <div className="gallery-toolbar">
      <label className="gallery-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索代码、练习名称或知识点…" aria-label="搜索代码片段" /></label>
      <label className="gallery-sort-control"><span>排序</span><select className="gallery-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as "newest" | "title" | "category")} aria-label="代码片段排序"><option value="newest">最新添加</option><option value="title">按名称</option><option value="category">按分类</option></select></label>
      <div className="gallery-view-toggle" aria-label="切换展示方式"><button className={layout === "grid" ? "active" : ""} onClick={() => setLayout("grid")} aria-pressed={layout === "grid"}>▦ 网格</button><button className={layout === "list" ? "active" : ""} onClick={() => setLayout("list")} aria-pressed={layout === "list"}>☷ 列表</button></div>
    </div>
    <div className="gallery-filter-row">{categories.map((entry) => <button key={entry} className={category === entry ? "active" : ""} onClick={() => setCategory(entry)}>{entry}</button>)}</div>
    <div className="gallery-result-line"><span>当前展示 <strong>{filtered.length}</strong> 个代码片段</span><button onClick={() => { setQuery(""); setCategory("全部片段"); }}>重置筛选 ×</button></div>

    {loading ? <div className="detail-loading"><span className="loading-dot" /><p>正在同步已发布的代码片段…</p></div>
      : filtered.length ? <div className={layout === "grid" ? "code-gallery-grid" : "code-gallery-list"}>
        {sortedItems.map((item, index) => <article className="code-gallery-card" key={item.id}>
          <div className="code-gallery-top"><span className="gallery-window-dots"><i /><i /><i /></span><small>{item.category} / {String(index + 1).padStart(2, "0")}</small><button onClick={() => setPreviewItem(item)}>放大预览 ↗</button></div>
          <div className="code-gallery-info"><span className="eyebrow">{item.category} · PYTHON</span><h2>{item.title}</h2><p>{item.summary}</p></div>
          <pre className="gallery-code-preview">{item.code.split("\n").slice(0, 7).map((line, lineIndex) => <span key={lineIndex}><i>{String(lineIndex + 1).padStart(2, "0")}</i>{line || " "}</span>)}{item.code.split("\n").length > 7 && <em>… 更多代码</em>}</pre>
          <div className="code-gallery-bottom"><div>{item.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="gallery-card-actions"><button onClick={() => copyCode(item)}>{copied === item.id ? "已复制 ✓" : "复制代码"}</button><Link href={`/exercises/${item.slug}`}>查看完整练习 <b>↗</b></Link></div></div>
        </article>)}
      </div> : <div className="empty-state"><strong>{items.length ? "暂时没有匹配的代码片段" : "还没有已发布的代码片段"}</strong><p>{items.length ? "换一个关键词，或重置分类继续浏览。" : "图库会自动同步后台已发布的 Python 练习。"}</p>{items.length > 0 && <button className="button button-light" onClick={() => { setQuery(""); setCategory("全部片段"); }}>重置筛选</button>}</div>}

    {previewItem && <div className="gallery-preview-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewItem(null); }}>
      <section className="gallery-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-preview-title">
        <div className="gallery-preview-header"><div><span className="eyebrow">{previewItem.category} · PYTHON SOURCE</span><h2 id="gallery-preview-title">{previewItem.title}</h2></div><button onClick={() => setPreviewItem(null)} aria-label="关闭代码预览">×</button></div>
        <div className="gallery-preview-toolbar"><span>{previewItem.slug}.py</span><button onClick={() => copyCode(previewItem)}>{copied === previewItem.id ? "已复制 ✓" : "复制完整代码"}</button></div>
        <pre className="gallery-preview-code">{previewItem.code.split("\n").map((line, lineIndex) => <span key={lineIndex}><i>{String(lineIndex + 1).padStart(2, "0")}</i>{line || " "}</span>)}</pre>
        <div className="gallery-preview-footer"><span>{previewItem.code.split("\n").length} 行代码</span><Link href={`/exercises/${previewItem.slug}`}>进入完整练习 ↗</Link></div>
      </section>
    </div>}
  </main><Footer /></>;
}
