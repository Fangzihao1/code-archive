"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ExerciseCard from "@/components/ExerciseCard";
import { getExercises } from "@/lib/storage";
import type { Exercise } from "@/lib/types";

const FAVORITES_KEY = "code-archive-favorites-v1";

export default function ExercisesPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部练习");
  const [sort, setSort] = useState("new");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  useEffect(() => {
    setItems(getExercises().filter((x) => x.published));
    const params = new URLSearchParams(window.location.search);
    const selected = params.get("category");
    if (selected) setCategory(selected);
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored) as string[]);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    function handleKeys(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
        searchRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, []);

  const categories = useMemo(
    () => ["全部练习", ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))],
    [items]
  );

  const filtered = useMemo(() => items.filter((item) => {
    const matchesCategory = category === "全部练习" || item.category === category || item.tags.includes(category);
    const normalized = query.trim().toLowerCase();
    const matchesQuery = !normalized || `${item.title} ${item.summary} ${item.category} ${item.tags.join(" ")}`.toLowerCase().includes(normalized);
    const matchesFavorite = !onlyFavorites || favorites.includes(item.id);
    return matchesCategory && matchesQuery && matchesFavorite;
  }).sort((a, b) => {
    if (sort === "old") return a.date.localeCompare(b.date);
    if (sort === "title") return a.title.localeCompare(b.title, "zh-CN");
    return b.date.localeCompare(a.date);
  }), [items, query, category, sort, onlyFavorites, favorites]);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function resetFilters() {
    setQuery("");
    setCategory("全部练习");
    setSort("new");
    setOnlyFavorites(false);
  }

  function openRandom() {
    if (!filtered.length) return;
    const item = filtered[Math.floor(Math.random() * filtered.length)];
    router.push(`/exercises/${item.slug}`);
  }

  return <>
    <SiteHeader />
    <main className="content-wrap page-main library-page">
      <div className="page-intro library-intro">
        <div className="eyebrow">THE EXERCISE LIBRARY / PYTHON</div>
        <h1>把想法，写成代码<span>.</span></h1>
        <p>搜索知识点、筛选练习，或随机打开一道题开始实践。</p>
        <div className="library-quick-actions">
          <button type="button" className="button button-primary" onClick={openRandom} disabled={!filtered.length}>随机探索 <span>↗</span></button>
          <button type="button" className={onlyFavorites ? "library-favorite-filter active" : "library-favorite-filter"} onClick={() => setOnlyFavorites((value) => !value)}>
            <span>{onlyFavorites ? "♥" : "♡"}</span> 我的收藏 <small>{favorites.length}</small>
          </button>
        </div>
      </div>

      <section className="library-controls" aria-label="练习筛选">
        <div className="library-search-wrap">
          <span aria-hidden="true">⌕</span>
          <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、关键词或知识点…" aria-label="搜索练习" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="清除搜索">×</button>}
          <kbd>/</kbd>
        </div>
        <div className="library-control-right">
          <label className="sr-only" htmlFor="library-sort">排序方式</label>
          <select id="library-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="new">最新发布</option>
            <option value="old">最早发布</option>
            <option value="title">按标题排序</option>
          </select>
          <div className="view-switch" aria-label="显示方式">
            <button type="button" className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="网格视图">▦</button>
            <button type="button" className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="列表视图">☰</button>
          </div>
        </div>
      </section>

      <div className="category-chips" aria-label="按分类筛选">
        {categories.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}{item === "全部练习" && <span>{items.length}</span>}</button>)}
      </div>

      <div className="library-result-bar">
        <span>显示 <strong>{filtered.length}</strong> / {items.length} 条练习</span>
        <button type="button" onClick={resetFilters}>重置筛选 <span>↺</span></button>
      </div>

      {filtered.length ? (
        <div className={view === "grid" ? "card-grid library-card-grid" : "card-grid library-card-grid list-view"}>
          {filtered.map((item) => <article className="library-result-item" key={item.id}>
            <button type="button" className={favorites.includes(item.id) ? "favorite-toggle saved" : "favorite-toggle"} onClick={() => toggleFavorite(item.id)} aria-label={favorites.includes(item.id) ? "取消收藏" : "加入收藏"} title={favorites.includes(item.id) ? "取消收藏" : "加入收藏"}>{favorites.includes(item.id) ? "♥" : "♡"}</button>
            <ExerciseCard item={item} />
          </article>)}
        </div>
      ) : (
        <div className="empty-state library-empty">
          <span className="empty-symbol">⌕</span>
          <strong>{onlyFavorites && !favorites.length ? "还没有收藏的练习" : "没有找到相关练习"}</strong>
          <p>{onlyFavorites && !favorites.length ? "浏览练习卡片，点击右上角的心形按钮即可收藏。" : "试试其他关键词，或调整分类筛选条件。"}</p>
          <button type="button" className="button button-light" onClick={resetFilters}>查看全部练习</button>
        </div>
      )}
    </main>
    <Footer />
  </>;
}
