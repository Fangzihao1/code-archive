"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import HorizontalExerciseRail from "@/components/HorizontalExerciseRail";
import { getExercises } from "@/lib/storage";
import type { Exercise } from "@/lib/types";

export default function HomePage() {
  const [items, setItems] = useState<Exercise[]>([]);
  useEffect(() => { setItems(getExercises().filter((item) => item.published)); }, []);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="home-hero content-wrap">
          <div className="home-hero-copy">
            <div className="eyebrow">A PERSONAL PYTHON ARCHIVE</div>
            <h1>把代码，变成<br /><span>看得见的成长。</span></h1>
            <p>从课堂练习到实际应用，整理每一次编程实践。<br />用代码梳理思路，用运行验证想法。</p>
            <div className="home-hero-actions">
              <Link className="button button-primary" href="/exercises">探索练习库 <span>↗</span></Link>
              <Link className="home-secondary-link" href="/about">了解档案 <span>→</span></Link>
            </div>
          </div>
          <div className="hero-code-card">
            <div className="fake-window"><i /><i /><i /><span>main.py</span></div>
            <pre><b>01</b> <em>name</em> = <strong>input</strong>(<mark>"请输入姓名："</mark>){"\n"}<b>02</b> <strong>print</strong>(<mark>"Hello, "</mark> + name){"\n"}<b>03</b> <span className="code-muted"># keep learning, keep building.</span></pre>
            <div className="code-card-caption"><span>PYTHON / DAILY PRACTICE</span><span>01 — 03</span></div>
          </div>
          <div className="hero-bottom-note"><span>SCROLL TO EXPLORE</span><span>学习 · 实践 · 归档</span></div>
        </section>

        <section className="section content-wrap home-featured">
          <div className="section-heading">
            <div><div className="eyebrow">SELECTED WORK / 01</div><h2>精选练习</h2><p>横向浏览值得记录的 Python 学习成果。</p></div>
            <Link href="/exercises" className="text-link">查看全部练习 ↗</Link>
          </div>
          {items.length > 0
            ? <HorizontalExerciseRail items={items.slice(0, 8)} />
            : <div className="home-empty"><strong>练习档案正在整理中</strong><span>发布练习后，它们会出现在这里。</span><Link href="/exercises">浏览练习库 ↗</Link></div>}
        </section>
      </main>
      <Footer />
    </>
  );
}
