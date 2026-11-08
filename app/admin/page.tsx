"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getExercises } from "@/lib/storage";
import {
  archiveCloudExercise, bulkArchiveExercises, bulkSetPublished, getAdminExercises, getExerciseVersions, importLocalExercisesOnce,
  renameExerciseCategory, renameExerciseTag, restoreArchivedExercise, restoreExerciseVersion, saveCloudExercise,
} from "@/lib/exercises-cloud";
import type { Exercise, ExerciseVersion } from "@/lib/types";

const blank: Exercise = { id: "", slug: "", title: "", summary: "", category: "基础语法", tags: [], date: new Date().toISOString().slice(0, 10), code: "print('Hello, Python!')", stdin: "", expected: "", description: "", learning: "", allowRun: true, externalUrl: "https://www.online-python.com/", published: false, featured: false, archived: false };
const sections = ["工作台", "练习管理", "分类管理", "标签管理", "回收站"];

export default function AdminPage() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [form, setForm] = useState<Exercise>(blank);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("工作台");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [historyItem, setHistoryItem] = useState<Exercise | null>(null);
  const [versions, setVersions] = useState<ExerciseVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setHistoryItem(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage("请先填写练习标题。");
      return;
    }
    const slug = form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9\\u4e00-\\u9fa5]+/g, "-").replace(/^-|-$/g, "") || crypto.randomUUID();
    if (items.some((item) => item.slug === slug && item.id !== form.id && !item.archived)) {
      setMessage("这个练习标识已被使用，请修改标识后再保存。");
      return;
    }
    const nextItem: Exercise = { ...form, id: form.id || crypto.randomUUID(), slug, title: form.title.trim(), tags: form.tags, archived: false };
    setSaving(true);
    setMessage("");
    try {
      await saveCloudExercise(nextItem);
      setItems((current) => current.some((item) => item.id === nextItem.id)
        ? current.map((item) => item.id === nextItem.id ? nextItem : item)
        : [nextItem, ...current]);
      setForm(blank);
      setEditing(false);
      setMessage("练习已保存并同步到云端，修改前的内容已自动留存为历史版本。");
    } catch {
      setMessage("保存失败：请确认当前账号具有管理员权限，稍后可重试。");
    } finally {
      setSaving(false);
    }
  }

  async function bulkPublish(published: boolean) {
    if (!selectedIds.length) return;
    try {
      await bulkSetPublished(selectedIds, published);
      setItems((current) => current.map((item) => selectedIds.includes(item.id)
        ? { ...item, published, featured: published ? item.featured : false }
        : item));
      setMessage(published ? `已批量发布 ${selectedIds.length} 条练习。` : `已批量下架 ${selectedIds.length} 条练习。`);
      setSelectedIds([]);
    } catch {
      setMessage("批量操作失败，请检查管理员权限或网络连接。");
    }
  }

  async function bulkArchive() {
    if (!selectedIds.length) return;
    if (!window.confirm(`确定将选中的 ${selectedIds.length} 条练习移入回收站吗？`)) return;
    try {
      await bulkArchiveExercises(selectedIds);
      setItems((current) => current.map((item) => selectedIds.includes(item.id)
        ? { ...item, archived: true, published: false, featured: false }
        : item));
      setMessage(`已将 ${selectedIds.length} 条练习移入回收站。`);
      setSelectedIds([]);
    } catch {
      setMessage("批量归档失败，请检查网络或账号权限。");
    }
  }

  async function renameCategory(category: string) {
    const nextName = window.prompt("输入新的分类名称", category)?.trim();
    if (!nextName || nextName === category) return;
    if (categories.includes(nextName)) {
      setMessage("这个分类名称已经存在。");
      return;
    }
    try {
      await renameExerciseCategory(category, nextName);
      await loadItems();
      setMessage(`分类“${category}”已更名为“${nextName}”。`);
    } catch {
      setMessage("分类修改失败，请检查网络或账号权限。");
    }
  }

  async function renameTag(tag: string) {
    const nextName = window.prompt("输入新的标签名称", tag)?.trim();
    if (!nextName || nextName === tag) return;
    if (tags.includes(nextName)) {
      setMessage("这个标签名称已经存在。");
      return;
    }
    try {
      await renameExerciseTag(tag, nextName);
      await loadItems();
      setMessage(`标签“${tag}”已更名为“${nextName}”。`);
    } catch {
      setMessage("标签修改失败，请检查网络或账号权限。");
    }
  }

  async function archive(item: Exercise) {
    if (!window.confirm("将这条练习移入回收站？它会从访客页面下架，但内容和历史版本都会保留。")) return;
    try {
      await archiveCloudExercise(item.id);
      setItems((current) => current.map((entry) => entry.id === item.id
        ? { ...entry, archived: true, published: false, featured: false }
        : entry));
      setMessage("练习已移入回收站，可以随时恢复。");
      if (form.id === item.id) { setForm(blank); setEditing(false); }
    } catch {
      setMessage("移入回收站失败，请检查网络或账号权限。");
    }
  }

  async function restoreArchived(item: Exercise) {
    try {
      await restoreArchivedExercise(item.id);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, archived: false } : entry));
      setMessage("练习已恢复到练习管理，当前仍为草稿状态。");
    } catch {
      setMessage("恢复失败，请检查网络或账号权限。");
    }
  }

  async function openHistory(item: Exercise) {
    setHistoryItem(item);
    setVersions([]);
    setHistoryLoading(true);
    try {
      const rows = await getExerciseVersions(item.id);
      setVersions(rows);
    } catch {
      setMessage("历史版本读取失败，请检查版本记录表的访问权限。");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function restoreVersion(version: ExerciseVersion) {
    if (!window.confirm(`恢复到第 ${version.versionNumber} 个历史版本？当前内容会先自动保存为一个新版本。`)) return;
    try {
      await restoreExerciseVersion(version);
      await loadItems();
      setHistoryItem({ ...version.snapshot, archived: false, published: false, featured: false });
      setMessage(`已恢复到历史版本 ${version.versionNumber}。为避免意外公开，恢复后先设为草稿。`);
    } catch {
      setMessage("版本恢复失败，请检查网络或账号权限。");
    }
  }

  function exportBackup() {
    const backup = {
      product: "CODE ARCHIVE",
      formatVersion: 2,
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
    setMessage("备份文件已生成，包含练习内容与回收站状态，请妥善保存。");
  }

  async function importBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload: unknown = JSON.parse(await file.text());
      const rows = (payload as { exercises?: unknown })?.exercises;
      if (!Array.isArray(rows)) throw new Error("invalid");
      const imported = rows.map((value: unknown) => {
        const row = value as Partial<Exercise>;
        if (typeof row.id !== "string" || typeof row.slug !== "string" || typeof row.title !== "string" || typeof row.code !== "string") {
          throw new Error("invalid");
        }
        return {
          ...blank,
          ...row,
          tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
          archived: Boolean(row.archived),
          published: Boolean(row.published) && !Boolean(row.archived),
          featured: Boolean(row.featured) && !Boolean(row.archived),
        } as Exercise;
      });
      if (!imported.length) throw new Error("empty");
      if (!window.confirm(`准备导入 ${imported.length} 条练习。相同 ID 的内容会被备份覆盖，其他记录保留，不会清空云端数据。是否继续？`)) return;
      setSaving(true);
      for (const item of imported) await saveCloudExercise(item);
      await loadItems();
      setMessage(`已导入 ${imported.length} 条练习。相同 ID 的旧内容已由数据库自动保留历史版本。`);
    } catch {
      setMessage("导入失败：请确认文件是 CODE ARCHIVE 导出的有效 JSON 备份。");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }

  const isError = /失败|请先|已被使用/.test(message);
  const activeItems = items.filter((item) => !item.archived);
  const archivedItems = items.filter((item) => item.archived);
  const categories = Array.from(new Set(activeItems.map((item) => item.category))).sort();
  const tags = Array.from(new Set(activeItems.flatMap((item) => item.tags))).sort();

  return <main className="admin-shell">
    <aside className="admin-sidebar"><Link href="/home" className="brand">CODE ARCHIVE</Link><div className="admin-label">CONTENT MANAGER</div>
      {sections.map((section, index) => <button type="button" key={section} onClick={() => { setActiveSection(section); if (section !== "练习管理") { setEditing(false); setForm(blank); } if (section !== "练习管理") setHistoryItem(null); }} className={activeSection === section ? "side-item selected" : "side-item"} aria-current={activeSection === section ? "page" : undefined}>{["⌂", "▤", "▦", "#", "↺"][index]}　{section}</button>)}
      <Link href="/home" className="side-logout">返回作品集</Link>
    </aside>

    <section className="admin-content">
      <div className="admin-top"><div><Link href="/home" className="admin-back-link">← 返回作品集</Link><div className="eyebrow">ADMIN / DASHBOARD</div><h1>{activeSection}</h1><p>{activeSection === "工作台" ? "查看内容概况，快速进入练习管理。" : activeSection === "练习管理" ? "创建、编辑、发布或下架 Python 课堂练习。" : activeSection === "回收站" ? "已移除的练习暂存在这里，可以恢复，不会立即销毁。" : "查看当前练习中实际使用的分类与标签。"}</p></div><div className="admin-top-actions">
        <button className="button button-light" onClick={exportBackup} disabled={loading || items.length === 0}>↓ 导出备份</button>
        <button className="button button-light" onClick={() => fileInputRef.current?.click()} disabled={loading || saving}>↑ 导入备份</button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={importBackup} />
        <button className="button button-light" onClick={() => void loadItems()} disabled={loading}>{loading ? "同步中…" : "↻ 刷新数据"}</button><Link href="/home" className="text-link">查看网站 ↗</Link></div></div>

      <div className="stats-grid"><div><span>练习总数</span><strong>{loading ? "—" : activeItems.length}</strong></div><div><span>已发布</span><strong>{loading ? "—" : activeItems.filter((item) => item.published).length}</strong></div><div><span>草稿</span><strong>{loading ? "—" : activeItems.filter((item) => !item.published).length}</strong></div><div><span>主页精选</span><strong>{loading ? "—" : activeItems.filter((item) => item.published && item.featured).length}</strong></div></div>

      {activeSection === "回收站" ? <div className="admin-panel">
        <div className="panel-heading"><div><h2>已归档练习</h2><p>恢复后会回到练习管理，并保持草稿状态。</p></div></div>
        {message && <p className={isError ? "admin-message error" : "admin-message"} role="status">{message}</p>}
        {loading ? <div className="admin-loading">正在读取回收站…</div> : <div className="admin-list">{archivedItems.length ? archivedItems.map((item) => <div className="admin-row" key={item.id}><div><strong>{item.title}</strong><small>{item.category} · {item.date} · 已归档</small></div><div className="row-actions"><button onClick={() => void openHistory(item)}>历史版本</button><button onClick={() => void restoreArchived(item)}>恢复</button></div></div>) : <div className="admin-empty"><strong>回收站为空</strong><p>移入回收站的练习会保留在这里。</p></div>}</div>}
      </div> : (activeSection === "工作台" || activeSection === "练习管理") ? <div className="admin-panel">
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

        <div className="admin-bulk-bar">
          <label><input type="checkbox" checked={activeItems.length > 0 && activeItems.every((item) => selectedIds.includes(item.id))} onChange={(event) => setSelectedIds(event.target.checked ? activeItems.map((item) => item.id) : [])}/> 全选当前练习</label>
          <span>已选择 {selectedIds.length} 条</span>
          <div className="row-actions"><button onClick={() => void bulkPublish(true)} disabled={!selectedIds.length}>批量发布</button><button onClick={() => void bulkPublish(false)} disabled={!selectedIds.length}>批量下架</button><button className="danger" onClick={() => void bulkArchive()} disabled={!selectedIds.length}>批量归档</button></div>
        </div>

        {historyItem && <div className="admin-history-panel">
          <div className="panel-heading"><div><h2>历史版本 · {historyItem.title}</h2><p>每次保存前，系统都会自动留存上一版内容。</p></div><button className="button button-light" onClick={() => { setHistoryItem(null); setVersions([]); }}>关闭</button></div>
          {historyLoading ? <div className="admin-loading">正在读取历史版本…</div> : versions.length ? <div className="admin-list">{versions.map((version) => <div className="admin-row" key={version.id}><div><strong>版本 {version.versionNumber} · {version.snapshot.title}</strong><small>{new Date(version.createdAt).toLocaleString("zh-CN")} · {version.snapshot.category} · {version.snapshot.code.split("\n").length} 行代码</small></div><div className="row-actions"><button onClick={() => void restoreVersion(version)}>恢复此版本</button></div></div>)}</div> : <div className="admin-empty">暂时没有可查看的历史版本。</div>}
        </div>}

        {message && <p className={isError ? "admin-message error" : "admin-message"} role="status">{message}</p>}
        {loading ? <div className="admin-loading">正在从云端读取练习数据…</div> : <div className="admin-list">{activeItems.length ? activeItems.map((item) => <div className="admin-row" key={item.id}><div className="admin-row-main"><label className="admin-row-check"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}/></label><div><strong>{item.title}</strong><small>{item.category} · {item.date} · {item.published ? "已发布" : "草稿"} · {item.published && item.featured ? "主页精选" : "未精选"} · 最近修改 {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("zh-CN") : "—"}</small></div></div><div className="row-actions"><button onClick={() => void openHistory(item)}>历史版本</button><button onClick={() => edit(item)}>编辑</button><button className="danger" onClick={() => void archive(item)}>移入回收站</button></div></div>) : <div className="admin-empty"><strong>还没有练习内容</strong><p>创建第一条 Python 练习后，可以在这里编辑和发布。</p></div>}</div>}
      </div> : <div className="admin-panel">
        <div className="panel-heading"><div><h2>{activeSection}</h2><p>以下数据根据云端练习内容自动汇总。</p></div></div>
        {loading ? <div className="admin-loading">正在读取数据…</div> : activeSection === "分类管理" ? <div className="admin-list">{categories.length ? categories.map((category) => <div className="admin-row" key={category}><div><strong>{category}</strong><small>{activeItems.filter((item) => item.category === category).length} 条练习</small></div><div className="row-actions"><span className="admin-count">{activeItems.filter((item) => item.category === category && item.published).length} 条已发布</span><button onClick={() => void renameCategory(category)}>修改名称</button></div></div>) : <div className="admin-empty">暂无分类数据。</div>}</div>
          : <div className="admin-list">{tags.length ? tags.map((tag) => <div className="admin-row" key={tag}><div><strong>#{tag}</strong><small>{activeItems.filter((item) => item.tags.includes(tag)).length} 条练习使用</small></div><div className="row-actions"><span className="admin-count">{activeItems.filter((item) => item.tags.includes(tag) && item.published).length} 条已发布</span><button onClick={() => void renameTag(tag)}>修改名称</button></div></div>) : <div className="admin-empty">暂无标签数据。</div>}</div>}
      </div>}
      <p className="admin-warning">账号访问由 Supabase Auth 保护。练习内容保存在 Supabase 云端；访客页面只展示已发布内容。移入回收站不会立即删除数据，历史版本会继续保留。</p>
    </section>
  </main>;
}
