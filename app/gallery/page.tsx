import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
export default function GalleryPage() {
  return <><SiteHeader/><main className="content-wrap page-main"><div className="page-intro"><div className="eyebrow">CODE GALLERY</div><h1>代码图库<span>.</span></h1><p>集中整理 Python 代码截图与程序运行效果。图片内容可在后台逐步补充。</p></div><div className="gallery-placeholder"><div className="gallery-tile"><span>PYTHON / 01</span><strong>代码截图展示区</strong><small>后台图片管理功能将在后续接入。</small></div><div className="gallery-tile"><span>PYTHON / 02</span><strong>运行效果展示区</strong><small>用于展示程序实际运行结果。</small></div></div></main><Footer/></>;
}
