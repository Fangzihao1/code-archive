import Link from "next/link";
import type { Exercise } from "@/lib/types";

export default function ExerciseCard({ item }: { item: Exercise }) {
  return <Link href={`/exercises/${item.slug}`} className="exercise-card">
    <div className="card-visual"><span className="python-mark">Py</span><span className="visual-lines">01&nbsp;&nbsp; print("hello")<br/>02&nbsp;&nbsp; input()</span></div>
    <div className="card-body">
      <div className="eyebrow">{item.category} <span>· Python</span></div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <div className="tag-row">{item.tags.slice(0, 3).map(t => <span key={t}>{t}</span>)}</div>
      <div className="card-bottom"><small>{item.date}</small><strong>查看练习 ↗</strong></div>
    </div>
  </Link>;
}
