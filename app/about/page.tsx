import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import HeroGlowField from "@/components/HeroGlowField";
export default function AboutPage() {
  return <><SiteHeader/><main className="content-wrap page-main about-page page-ambient"><HeroGlowField/><div className="eyebrow">ABOUT THE ARCHIVE</div><h1>关于这个<br/><span>Python 学习档案。</span></h1><p className="about-lead">CODE ARCHIVE 是一个个人编程学习作品集，用来整理课堂练习、记录代码实践，并通过在线运行验证学习成果。</p><div className="about-columns"><div><h2>为什么建立它</h2><p>把零散的课堂练习整理成可持续更新的档案，让每一次编程实践都能被回顾、理解和展示。</p></div><div><h2>这里有什么</h2><p>Python 源代码、练习说明、代码截图、运行结果，以及每次练习背后的知识点与思考。</p></div></div></main><Footer/></>;
}
