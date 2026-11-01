"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getExercises, saveExercises } from "@/lib/storage";
import type { Exercise } from "@/lib/types";

const blank: Exercise = { id:"", slug:"", title:"", summary:"", category:"基础语法", tags:[], date:new Date().toISOString().slice(0,10), code:"print('Hello, Python!')", stdin:"", expected:"", description:"", learning:"", allowRun:true, externalUrl:"https://www.online-python.com/", published:false };

export default function AdminPage() {
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<Exercise[]>([]);
  const [form, setForm] = useState<Exercise>(blank);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { setItems(getExercises()); setLogged(sessionStorage.getItem("ca-admin")==="yes"); }, []);
  function login(e: React.FormEvent) { e.preventDefault(); if(username==="admin" && password==="demo123"){sessionStorage.setItem("ca-admin","yes");setLogged(true);} else setMessage("账号或密码不正确"); }
  function persist(next: Exercise[]) { setItems(next); saveExercises(next); }
  function edit(item: Exercise) { setForm({...item, tags:[...item.tags]}); setEditing(true); window.scrollTo({top:0,behavior:"smooth"}); }
  function create() { setForm({...blank,id:crypto.randomUUID()}); setEditing(true); }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const slug = form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g,"-").replace(/^-|-$/g,"") || crypto.randomUUID();
    const nextItem = {...form, id:form.id || crypto.randomUUID(), slug, tags:form.tags};
    const next = items.some(x=>x.id===nextItem.id) ? items.map(x=>x.id===nextItem.id?nextItem:x) : [nextItem,...items];
    persist(next); setForm(blank); setEditing(false); setMessage("练习已保存到当前浏览器。");
  }
  function remove(id:string) { if(confirm("确定删除这条练习吗？")) persist(items.filter(x=>x.id!==id)); }
  if(!logged) return <main className="login-shell"><form className="login-card" onSubmit={login}><Link href="/" className="brand">CODE ARCHIVE<span> / ADMIN</span></Link><div className="eyebrow">PRIVATE WORKSPACE</div><h1>管理员登录</h1><p>登录后管理你的 Python 练习内容。</p><label>账号<input value={username} onChange={e=>setUsername(e.target.value)}/></label><label>密码<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="输入演示密码"/></label>{message&&<small className="error-text">{message}</small>}<button className="button button-primary full-button">登录后台</button><small className="login-hint">本地演示账号：admin　密码：demo123</small><Link href="/" className="text-link">← 返回网站</Link></form></main>;
  return <main className="admin-shell"><aside className="admin-sidebar"><Link href="/home" className="brand">CODE ARCHIVE</Link><div className="admin-label">CONTENT MANAGER</div>{["工作台","练习管理","代码管理","图片管理","文件管理","分类管理","标签管理","页面内容","网站设置","操作日志"].map((x,i)=><div key={x} className={i===0?"side-item selected":"side-item"}>{["⌂","▤","‹›","▧","▱","▦","#","▤","⚙","≡"][i]}　{x}</div>)}<button className="side-logout" onClick={()=>{sessionStorage.removeItem("ca-admin");setLogged(false);}}>退出登录</button></aside>
    <section className="admin-content"><div className="admin-top"><div><div className="eyebrow">ADMIN / DASHBOARD</div><h1>工作台</h1><p>管理你的 Python 编程练习与学习成果。</p></div><Link href="/home" className="text-link">查看网站 ↗</Link></div>
      <div className="stats-grid"><div><span>练习总数</span><strong>{items.length}</strong></div><div><span>已发布</span><strong>{items.filter(x=>x.published).length}</strong></div><div><span>草稿</span><strong>{items.filter(x=>!x.published).length}</strong></div><div><span>可在线运行</span><strong>{items.filter(x=>x.allowRun).length}</strong></div></div>
      <div className="admin-panel"><div className="panel-heading"><div><h2>{editing?"编辑练习":"练习管理"}</h2><p>创建、编辑、测试并发布 Python 课堂练习。</p></div><button className="button button-primary" onClick={create}>＋ 新建练习</button></div>
        {editing && <form className="exercise-form" onSubmit={submit}>
          <div className="form-grid"><label>练习标题<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>练习分类<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{["基础语法","输入与输出","条件判断","循环结构","函数与模块","列表与字典","算法与逻辑","综合课堂作业"].map(x=><option key={x}>{x}</option>)}</select></label></div>
          <label>练习简介<input value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})}/></label>
          <label>知识点标签（用英文逗号分隔）<input value={form.tags.join(", ")} onChange={e=>setForm({...form,tags:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})}/></label>
          <label>练习说明<textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
          <label>Python 源代码<textarea className="admin-code" rows={10} value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/></label>
          <div className="form-grid"><label>示例输入（每行一项）<textarea rows={3} value={form.stdin} onChange={e=>setForm({...form,stdin:e.target.value})}/></label><label>预期输出<textarea rows={3} value={form.expected} onChange={e=>setForm({...form,expected:e.target.value})}/></label></div>
          <label>学习总结<textarea rows={3} value={form.learning} onChange={e=>setForm({...form,learning:e.target.value})}/></label>
          <label>外部运行平台 URL<input value={form.externalUrl} onChange={e=>setForm({...form,externalUrl:e.target.value})}/></label>
          <div className="check-row"><label><input type="checkbox" checked={form.allowRun} onChange={e=>setForm({...form,allowRun:e.target.checked})}/> 允许网页内运行</label><label><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> 立即公开发布</label></div>
          <div className="form-actions"><button type="button" className="button button-light" onClick={()=>{setEditing(false);setForm(blank);}}>取消</button><button className="button button-primary">保存练习</button></div>
        </form>}
        {message&&<p className="success-message">{message}</p>}
        <div className="admin-list">{items.map(x=><div className="admin-row" key={x.id}><div><strong>{x.title}</strong><small>{x.category} · {x.date} · {x.published?"已发布":"草稿"}</small></div><div className="row-actions"><button onClick={()=>edit(x)}>编辑</button><button onClick={()=>remove(x.id)}>删除</button></div></div>)}</div>
      </div>
      <p className="admin-warning">本后台为本地演示版：数据保存在当前浏览器，不是正式身份认证或云端数据库。正式上线前需要接入 Supabase Auth、数据库和文件存储。</p>
    </section>
  </main>;
}
