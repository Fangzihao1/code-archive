import Link from "next/link";
import type { Exercise } from "@/lib/types";

export default function ExerciseCard({ item }: { item: Exercise }) {
  const previewLines = (item.code || "").split(/\r?\n/).slice(0, 3);

  return <Link href={`/exercises/${item.slug}`} className="exercise-card">
    <div className="card-visual">
      <span className="python-mark">Py</span>
      <pre className="visual-lines" aria-label={`${item.title} 的 Python 源代码预览`}>{previewLines.map((line, index) => (
        <span key={index}>{String(index + 1).padStart(2, "0")}  {line || " "}</span>
      ))}</pre>
    </div>
    <div className="card-body">
      <div className="eyebrow">{item.category} <span>· Python</span></div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <div className="tag-row">{item.tags.slice(0, 3).map(t => <span key={t}>{t}</span>)}</div>
      <div className="card-bottom"><small>{item.date}</small><strong>查看练习 ↗</strong></div>
    </div>
  </Link>;
}
