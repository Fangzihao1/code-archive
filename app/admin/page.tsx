"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getExercises } from "@/lib/storage";
import { getAdminExercises, saveCloudExercise, deleteCloudExercise, importLocalExercisesOnce } from "@/lib/exercises-cloud";
import type { Exercise } from "@/lib/types";

const blank: Exercise = { id: "", slug: "", title: "", summary: "", category: "基础语法", tags: [], date: new Date().toISOString().slice(0, 10), code: "print('Hello, Python!')", stdin: "", expected: "", description: "", learning: "", allowRun: true, externalUrl: "https://www.online-python.com/", published: false, featured: false };
const sections = ["工作台", "练习管理", "分类管理", "标签管理"];

export default function AdminPage() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [form, setForm] = useState<Exercise>(blank);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("工作台");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      await importLocalExercisesOnce();
      const rows = await getAdminExercises();
      setItems(rows);
      setMessage("");
    } catch {
      setMessage("云端加载失败，请检查当前账号权限和网络连接。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadItems(); }, [loadItems]);

  function edit(item: Exercise) {
    setForm({ ...item, tags: [...item.tags] });
    setEditing(true);
    setActiveSection("练习管理");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function create() {
    setForm({ ...blank, id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10) });
    setEditing(true);
    setActiveSection("练习管理");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage("请先填写练习标题。");
      return;
    }
    const slug = form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "") || crypto.randomUUID();
    if (items.some((item) => item.slug === slug && item.id !== form.id)) {
      setMessage("这个练习标识已被使用，请修改标识后再保存。");
      return;
    }
    const nextItem: Exercise = { ...form, id: form.id || crypto.randomUUID(), slug, title: form.title.trim(), tags: form.tags };
    setSaving(true);
    setMessage("");
    try {
      await saveCloudExercise(nextItem);
      setItems((current) => current.some((item) => item.id === nextItem.id)
        ? current.map((item) => item.id === nextItem.id ? nextItem : item)
        : [nextItem, ...current]);
      setForm(blank);
      setEditing(false);
      setMessage("练习已保存并同步到云端。");
    } catch {
      setMessage("保存失败：请确认当前账号具有管理员权限，稍后可重试。");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("确定删除这条练习吗？删除后无法从网站恢复。")) return;
    try {
      await deleteCloudExercise(id);
      setItems((current) => current.filter((item) => item.id !== id));
      setMessage("练习已从云端删除。");
      if (form.id === id) { setForm(blank); setEditing(false); }
    } catch {
      setMessage("删除失败，请检查网络或账号权限。");
    }
  }

  function exportBackup() {
    const backup = {
      product: "CODE ARCHIVE",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      itemCount: items.length,
      exercises: items,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `code-archive-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setMessage("备份文件已生成，请妥善保存到安全位置。");
  }

  const isError = /失败|请先|已被使用/.test(message);
  const categories = Array.from(new Set(items.map((item) => item.category))).sort();
  const tags = Array.from(new Set(items.flatMap((item) => item.tags))).sort();

  return <main className="admin-shell">
    <aside className="admin-sidebar"><Link href="/home" className="brand">CODE ARCHIVE</Link><div className="admin-label">CONTENT MANAGER</div>
      {sections.map((section, index) => <button type="button" key={section} onClick={() => { setActiveSection(section); if (section !== "练习管理") { setEditing(false); setForm(blank); } }} className={activeSection === section ? "side-item selected" : "side-item"} aria-current={activeSection === section ? "page" : undefined}>{["⌂", "▤", "▦", "#"][index]}　{section}</button>)}
      <Link href="/home" className="side-logout">返回作品集</Link>
    </aside>

    <section className="admin-content">
      <div className="admin-top"><div><div className="eyebrow">ADMIN / DASHBOARD</div><h1>{activeSection}</h1><p>{activeSection === "工作台" ? "查看内容概况，快速进入练习管理。" : activeSection === "练习管理" ? "创建、编辑、发布或下架 Python 课堂练习。" : "查看当前练习中实际使用的分类与标签。"}</p></div><div className="admin-top-actions"><button className="button button-light" onClick={exportBackup} disabled={loading || items.length === 0}>↓ 导出备份</button><button className="button button-light" onClick={() => void loadItems()} disabled={loading}>{loading ? "同步中…" : "↻ 刷新数据"}</button><Link href="/home" className="text-link">查看网站 ↗</Link></div></div>

      <div className="stats-grid"><div><span>练习总数</span><strong>{loading ? "—" : items.length}</strong></div><div><span>已发布</span><strong>{loading ? "—" : items.filter((item) => item.published).length}</strong></div><div><span>草稿</span><strong>{loading ? "—" : items.filter((item) => !item.published).length}</strong></div><div><span>主页精选</span><strong>{loading ? "—" : items.filter((item) => item.published && item.featured).length}</strong></div></div>

      {(activeSection === "工作台" || activeSection === "练习管理") ? <div className="admin-panel">
        <div className="panel-heading"><div><h2>{editing ? (items.some((item) => item.id === form.id) ? "编辑练习" : "新建练习") : "练习内容"}</h2><p>保存后同步到 Supabase；只有已发布内容会出现在访客页面。</p></div><button className="button button-primary" onClick={create}>＋ 新建练习</button></div>

        {editing && <form className="exercise-form" onSubmit={submit}>
          <div className="form-grid"><label>练习标题<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="例如：认识 print() 输出"/></label><label>练习标识（URL）<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="留空则根据标题生成"/></label></div>
          <div className="form-grid"><label>练习分类<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{["基础语法", "输入与输出", "条件判断", "循环结构", "函数与模块", "列表与字典", "算法与逻辑", "综合课堂作业"].map((entry) => <option key={entry}>{entry}</option>)}</select></label><label>发布日期<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })}/></label></div>
          <label>练习简介<input value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="用一句话概括练习内容"/></label>
          <label>知识点标签（用英文逗号分隔）<input value={form.tags.join(", ")} onChange={(event) => setForm({ ...form, tags: event.target.value.split(",").map((entry) => entry.trim()).filter(Boolean) })}/></label>
          <label>练习说明<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })}/></label>
          <label>Python 源代码<textarea className="admin-code" rows={10} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })}/></label>
          <div className="form-grid"><label>示例输入（每行一项）<textarea rows={3} value={form.stdin} onChange={(event) => setForm({ ...form, stdin: event.target.value })}/></label><label>预期输出<textarea rows={3} value={form.expected} onChange={(event) => setForm({ ...form, expected: event.target.value })}/></label></div>
          <label>学习总结<textarea rows={3} value={form.learning} onChange={(event) => setForm({ ...form, learning: event.target.value })}/></label>
          <label>外部运行平台 URL<input type="url" value={form.externalUrl} onChange={(event) => setForm({ ...form, externalUrl: event.target.value })} placeholder="https://…"/></label>
          <div className="check-row"><label><input type="checkbox" checked={form.allowRun} onChange={(event) => setForm({ ...form, allowRun: event.target.checked })}/> 允许网页内运行</label><label><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })}/> 立即公开发布</label><label className="featured-toggle"><input type="checkbox" checked={!!form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })}/> <span><strong>显示在主页精选练习</strong><small>只有已发布且勾选精选的练习才会出现在首页。</small></span></label></div>
          <div className="form-actions"><button type="button" className="button button-light" onClick={() => { setEditing(false); setForm(blank); }}>取消</button><button className="button button-primary" disabled={saving}>{saving ? "正在保存…" : "保存练习"}</button></div>
        </form>}

        {message && <p className={isError ? "admin-message error" : "admin-message"} role="status">{message}</p>}
        {loading ? <div className="admin-loading">正在从云端读取练习数据…</div> : <div className="admin-list">{items.length ? items.map((item) => <div className="admin-row" key={item.id}><div><strong>{item.title}</strong><small>{item.category} · {item.date} · {item.published ? "已发布" : "草稿"} · {item.published && item.featured ? "主页精选" : "未精选"}</small></div><div className="row-actions"><button onClick={() => edit(item)}>编辑</button><button className="danger" onClick={() => void remove(item.id)}>删除</button></div></div>) : <div className="admin-empty"><strong>还没有练习内容</strong><p>创建第一条 Python 练习后，可以在这里编辑和发布。</p></div>}</div>}
      </div> : <div className="admin-panel">
        <div className="panel-heading"><div><h2>{activeSection}</h2><p>以下数据根据云端练习内容自动汇总。</p></div></div>
        {loading ? <div className="admin-loading">正在读取数据…</div> : activeSection === "分类管理" ? <div className="admin-list">{categories.length ? categories.map((category) => <div className="admin-row" key={category}><div><strong>{category}</strong><small>{items.filter((item) => item.category === category).length} 条练习</small></div><span className="admin-count">{items.filter((item) => item.category === category && item.published).length} 条已发布</span></div>) : <div className="admin-empty">暂无分类数据。</div>}</div>
          : <div className="admin-list">{tags.length ? tags.map((tag) => <div className="admin-row" key={tag}><div><strong>#{tag}</strong><small>{items.filter((item) => item.tags.includes(tag)).length} 条练习使用</small></div><span className="admin-count">{items.filter((item) => item.tags.includes(tag) && item.published).length} 条已发布</span></div>) : <div className="admin-empty">暂无标签数据。</div>}</div>}
      </div>}
      <p className="admin-warning">账号访问由 Supabase Auth 保护。练习内容保存在 Supabase 云端；访客页面只展示已发布内容。删除操作会同步删除云端记录。</p>
    </section>
  </main>;
}
