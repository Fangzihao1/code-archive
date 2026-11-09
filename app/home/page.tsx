"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import HorizontalExerciseRail from "@/components/HorizontalExerciseRail";
import HeroPythonLab from "@/components/HeroPythonLab";
import HeroGlowField from "@/components/HeroGlowField";
import InteractiveTopicGrid from "@/components/InteractiveTopicGrid";
import HomeSectionWheelSnap from "@/components/HomeSectionWheelSnap";
import { getExercises } from "@/lib/storage";
import { getFeaturedExercises } from "@/lib/exercises-cloud";
import type { Exercise } from "@/lib/types";

export default function HomePage() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".archive-reveal"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduceMotion) return;

    sections.forEach((section) => section.classList.add("archive-reveal-pending"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
        } else {
          entry.target.classList.remove("is-revealed");
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      sections.forEach((section) => section.classList.remove("archive-reveal-pending"));
    };
  }, []);

  useEffect(() => {
    const update = () => setShowBackToTop(window.scrollY > 520);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    let active = true;
    getFeaturedExercises().then((rows) => { if (active) setItems(rows); })
      .catch(() => { if (active) setItems(getExercises().filter((item) => item.published && item.featured)); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <SiteHeader />
      <HomeSectionWheelSnap />
      <main>
        <section className="home-hero content-wrap">
          <HeroGlowField />
          <div className="home-hero-copy">
            <h1>把代码，变成<br /><span>看得见的成长。</span></h1>
            <p>从课堂练习到实际应用，整理每一次编程实践。<br />用代码梳理思路，用运行验证想法。</p>
            <div className="home-hero-actions">
              <Link className="button button-primary" href="/exercises">探索练习库 <span>↗</span></Link>
              <Link className="home-secondary-link" href="/about">了解档案 <span>→</span></Link>
            </div>
          </div>
          <HeroPythonLab />
        </section>

        <section className="section content-wrap home-featured archive-reveal">
          <div className="section-heading">
            <div><div className="eyebrow">SELECTED WORK / 01</div><h2>精选练习</h2><p>横向浏览值得记录的 Python 学习成果。</p></div>
            <Link href="/exercises" className="text-link">查看全部练习 ↗</Link>
          </div>
          {items.length > 0
            ? <HorizontalExerciseRail items={items.slice(0, 12)} />
            : <div className="home-empty"><strong>练习档案正在整理中</strong><span>发布练习后，它们会出现在这里。</span><Link href="/exercises">浏览练习库 ↗</Link></div>}
        </section>

        <section className="section category-section archive-reveal">
          <div className="content-wrap">
            <div className="eyebrow">EXPLORE BY TOPIC / 02</div>
            <h2>从一个知识点开始。</h2>
            <p className="muted">按照课堂知识结构整理，让每一次练习都更容易找到。</p>
            <InteractiveTopicGrid />
          </div>
        </section>

        <section className="section content-wrap about-strip archive-reveal">
          <div><div className="eyebrow">ABOUT THIS ARCHIVE / 03</div><h2>每一段代码，<br />都是成长的记录。</h2></div>
          <p>这是一个持续更新的个人 Python 学习档案，记录课堂练习、代码思路和实际运行结果。</p>
          <Link className="button button-light" href="/about">关于这个档案 ↗</Link>
        </section>
      </main>
      <Footer />
      <button
        type="button"
        className={`back-to-top ${showBackToTop ? "is-visible" : ""}`}
        aria-label="回到页面顶部"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span aria-hidden="true">↑</span>
        <small>回到顶部</small>
      </button>
    </>
  );
}
