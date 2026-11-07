"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { getExercises } from "@/lib/storage";
import { getPublishedExercises } from "@/lib/exercises-cloud";
import type { Exercise } from "@/lib/types";

const categories = ["全部练习","基础语法","输入与输出","条件判断","循环结构","函数与模块","列表与字典","算法与逻辑","综合课堂作业"];

function ExerciseLibraryCard({ item }: { item: Exercise }) {
  const previewLines = (item.code || "").split(/\\r?\\n/).slice(0, 3);
  return <a href={`/exercises/${item.slug}`} className="exercise-library-card">
    <div className="exercise-library-visual">
      <div className="exercise-library-visual-top"><span>PYTHON</span><i>● ● ●</i></div>
      <div className="exercise-library-code">
        <strong>Py</strong>
        <div>{previewLines.map((line, index) => <span key={index}><i>{String(index + 1).padStart(2, "0")}</i>{line || " "}</span>)}</div>
      </div>
      <small>CODE ARCHIVE / EXERCISE</small>
    </div>
    <div className="exercise-library-content">
      <div className="eyebrow">{item.category} <span>· Python</span></div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <div className="tag-row">{item.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div>
      <div className="exercise-library-bottom"><small>{item.date}</small><strong>查看练习 <span>↗</span></strong></div>
    </div>
  </a>;
}

export default function ExercisesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部练习");
  const [sort, setSort] = useState("new");
  useEffect(() => {
    getPublishedExercises().then(setItems).catch(() => setItems(getExercises().filter(x => x.published)));
    const params = new URLSearchParams(window.location.search);
    const c = params.get("category");
    if (c) setCategory(c);
  }, []);
  const filtered = useMemo(() => items.filter(x => {
    const matchesCategory = category === "全部练习" || x.category === category || x.tags.includes(category);
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${x.title} ${x.summary} ${x.category} ${x.tags.join(" ")}`.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  }).sort((a,b) => sort === "old" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)), [items, query, category, sort]);
  function openRandom() {
    if (!filtered.length) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    router.push(`/exercises/${pick.slug}`);
  }
  return <><SiteHeader/><main className="content-wrap page-main">
    <div className="page-intro"><div className="eyebrow">THE EXERCISE LIBRARY</div><h1>Python 课堂练习<span>.</span></h1><p>整理每一次编程实践，记录学习过程中的思考与收获。</p></div>
    <div className="filter-bar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索练习名称、关键词或知识点…" aria-label="搜索练习"/><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="选择知识分类">{categories.map(x=><option key={x}>{x}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="排序方式"><option value="new">最新发布</option><option value="old">最早发布</option></select></div>
    <div className="quick-category-row" aria-label="快速选择分类">{categories.map(x=><button type="button" key={x} className={category===x?"quick-category active":"quick-category"} onClick={()=>setCategory(x)}>{x}</button>)}</div>
    <div className="result-line"><span>找到 <strong>{filtered.length}</strong> 条练习</span><div className="result-actions"><button className="random-exercise" onClick={openRandom} disabled={!filtered.length}>✦ 随机发现一题</button><button onClick={()=>{setQuery("");setCategory("全部练习");setSort("new");}}>清空筛选 ×</button></div></div>
    {filtered.length ? <div className="card-grid">{filtered.map(x=><ExerciseLibraryCard key={x.id} item={x}/>)}</div> : <div className="empty-state"><strong>没有找到相关练习</strong><p>试试其他关键词或清空筛选条件。</p></div>}
  </main><Footer/></>;
}
