import Link from "next/link";
export default function WelcomePage() {
  return <main className="welcome-page">
    <div className="welcome-top"><span className="brand">CODE ARCHIVE<span> / PYTHON</span></span><Link href="/admin" className="admin-link">管理员入口 ↗</Link></div>
    <section className="welcome-hero">
      <div className="welcome-kicker"><span className="tiny-dot"/> PERSONAL PYTHON LEARNING PORTFOLIO</div>
      <h1>CODE<br/><span>ARCHIVE.</span></h1>
      <p className="welcome-slogan">记录代码，积累成长。</p>
      <p className="welcome-desc">这里收藏我的 Python 课堂练习、课程作业与日常学习成果。<br/>从基础语法到小型程序，让每一段代码都留下实践的痕迹。</p>
      <div className="welcome-actions"><Link className="button button-primary" href="/home">进入作品集 <span>↗</span></Link><Link className="text-link" href="/about">关于本站</Link></div>
    </section>
    <div className="welcome-features">
      <div><strong>01 / CODE</strong><span>记录 Python 练习</span></div>
      <div><strong>02 / RUN</strong><span>在线运行与验证</span></div>
      <div><strong>03 / ARCHIVE</strong><span>保存学习成果</span></div>
    </div>
    <footer className="welcome-footer">© 2026 CODE ARCHIVE <span>MADE FOR LEARNING</span></footer>
  </main>;
}
