"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ExerciseCard from "@/components/ExerciseCard";
import { getExercises } from "@/lib/storage";
import type { Exercise } from "@/lib/types";

export default function HomePage() {
  const [items, setItems] = useState<Exercise[]>([]);
  useEffect(() => { setItems(getExercises().filter(x => x.published)); }, []);
  return <><SiteHeader/><main>
    <section className="home-hero content-wrap">
      <div className="eyebrow">A PERSONAL PYTHON ARCHIVE</div>
      <h1>我的 Python<br/><span>编程学习档案。</span></h1>
      <p>从课堂练习到实际应用，记录每一次代码实践。<br/>用代码整理思路，用运行验证想法。</p>
      <Link className="button button-primary" href="/exercises">浏览全部练习 ↗</Link>
      <div className="hero-code-card"><div className="fake-window"><i/><i/><i/><span>main.py</span></div><pre><b>01</b> <em>name</em> = <strong>input</strong>(<mark>"请输入姓名："</mark>){"\n"}<b>02</b> <strong>print</strong>(<mark>"Hello, "</mark> + name){"\n"}<b>03</b> <span className="code-muted"># keep learning, keep building.</span></pre></div>
    </section>
    <section className="section content-wrap">
      <div className="section-heading"><div><div className="eyebrow">SELECTED WORK</div><h2>精选练习</h2><p>一些值得记录的 Python 编程学习成果。</p></div><Link href="/exercises" className="text-link">查看全部 ↗</Link></div>
      <div className="card-grid">{items.slice(0, 3).map(x => <ExerciseCard key={x.id} item={x}/>)}</div>
    </section>
    <section className="section category-section"><div className="content-wrap"><div className="eyebrow">EXPLORE BY TOPIC</div><h2>探索我的 Python 练习</h2><p className="muted">按照课堂知识点整理，让每一次练习都更容易找到。</p><div className="topic-grid">{["基础语法","输入与输出","条件判断","循环结构","函数与模块","列表与字典","算法与逻辑","综合课堂作业"].map((x,i)=><Link href={`/exercises?category=${encodeURIComponent(x)}`} key={x}><span>0{i+1}</span><strong>{x}</strong><b>↗</b></Link>)}</div></div></section>
    <section className="section content-wrap about-strip"><div><div className="eyebrow">ABOUT THIS ARCHIVE</div><h2>每一段代码，<br/>都是成长的记录。</h2></div><p>这是一个持续更新的个人 Python 学习档案，记录课堂练习、代码思路和实际运行结果。</p><Link className="button button-light" href="/about">了解更多 ↗</Link></section>
  </main><Footer/></>;
}
