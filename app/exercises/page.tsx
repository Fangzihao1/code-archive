"use client";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ExerciseCard from "@/components/ExerciseCard";
import { getExercises } from "@/lib/storage";
import type { Exercise } from "@/lib/types";

const categories = ["全部练习","基础语法","输入与输出","条件判断","循环结构","函数与模块","列表与字典","算法与逻辑","综合课堂作业"];

export default function ExercisesPage() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部练习");
  const [sort, setSort] = useState("new");
  useEffect(() => {
    setItems(getExercises().filter(x => x.published));
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
  return <><SiteHeader/><main className="content-wrap page-main">
    <div className="page-intro"><div className="eyebrow">THE EXERCISE LIBRARY</div><h1>Python 课堂练习<span>.</span></h1><p>整理每一次编程实践，记录学习过程中的思考与收获。</p></div>
    <div className="filter-bar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索练习名称、关键词或知识点…"/><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="new">最新发布</option><option value="old">最早发布</option></select></div>
    <div className="result-line"><span>找到 {filtered.length} 条练习</span><button onClick={()=>{setQuery("");setCategory("全部练习");setSort("new");}}>清空筛选 ×</button></div>
    {filtered.length ? <div className="card-grid">{filtered.map(x=><ExerciseCard key={x.id} item={x}/>)}</div> : <div className="empty-state"><strong>没有找到相关练习</strong><p>试试其他关键词或清空筛选条件。</p></div>}
  </main><Footer/></>;
}
