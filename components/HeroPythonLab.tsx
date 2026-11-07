"use client";

import { useRef, useState } from "react";

const examples = [
  {
    id: "hello", label: "输出语句", file: "print.py",
    description: "让计算机说出第一句话",
    code: ['message = "Hello, Python!"', "print(message)", 'print("欢迎来到 CODE ARCHIVE")'],
    output: "Hello, Python!\n欢迎来到 CODE ARCHIVE", number: "01", accent: "blue",
  },
  {
    id: "condition", label: "条件判断", file: "condition.py",
    description: "根据条件，做出不同选择",
    code: ["score = 92", "if score >= 60:", '    print("恭喜你，成功通过！")', "else:", '    print("再接再厉！")'],
    output: "恭喜你，成功通过！", number: "02", accent: "violet",
  },
  {
    id: "loop", label: "循环结构", file: "loop.py",
    description: "让一段代码重复执行",
    code: ["for number in range(1, 4):", "    print(number)", 'print("循环完成！")'],
    output: "1\n2\n3\n循环完成！", number: "03", accent: "mint",
  },
] as const;

export default function HeroPythonLab() {
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const startX = useRef(0);
  const pointerId = useRef<number | null>(null);
  const activeExample = examples[active];

  function finishSwipe() {
    setDragging(false);
    setLeaving(true);
    setDragX(-150);
    window.setTimeout(() => {
      setActive((current) => (current + 1) % examples.length);
      setDragX(0);
      setLeaving(false);
      setHasRun(false);
    }, 250);
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    startX.current = event.clientX;
    pointerId.current = event.pointerId;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!dragging || pointerId.current !== event.pointerId || leaving) return;
    setDragX(Math.max(-180, Math.min(24, event.clientX - startX.current)));
  }

  function onPointerEnd(event: React.PointerEvent<HTMLElement>) {
    if (pointerId.current !== event.pointerId) return;
    pointerId.current = null;
    if (dragX < -72) finishSwipe();
    else {
      setDragging(false);
      setDragX(0);
    }
  }

  function runExample() {
    setHasRun(false);
    setRunCount((count) => count + 1);
    window.setTimeout(() => setHasRun(true), 100);
  }

  return (
    <section className="hero-python-deck" aria-label="Python 知识卡片轮播">
      <div className="hero-deck-stage">
        {examples.map((example, index) => {
          const offset = (index - active + examples.length) % examples.length;
          const isActive = offset === 0;
          const isNext = offset === 1;
          const isLast = offset === 2;
          const style: React.CSSProperties = isActive
            ? { transform: `translate3d(${dragX}px, 0, 0) rotate(${dragX / 34}deg)`, zIndex: 3, opacity: leaving ? 0 : 1 }
            : isNext
              ? { transform: "translate3d(27px, 12px, 0) scale(.955) rotate(2deg)", zIndex: 2, opacity: 1 }
              : { transform: "translate3d(48px, 23px, 0) scale(.91) rotate(4deg)", zIndex: 1, opacity: 1 };
          return (
            <article
              key={example.id}
              className={"hero-code-card hero-python-lab deck-card accent-" + example.accent + (isActive ? " is-active" : " is-behind") + (dragging && isActive ? " is-dragging" : "")}
              style={style}
              onPointerDown={isActive ? onPointerDown : undefined}
              onPointerMove={isActive ? onPointerMove : undefined}
              onPointerUp={isActive ? onPointerEnd : undefined}
              onPointerCancel={isActive ? onPointerEnd : undefined}
              aria-hidden={!isActive}
            >
              <div className="lab-topbar">
                <div className="lab-window-dots"><i /><i /><i /></div>
                <span className="lab-file-name">{example.number} / {example.file}</span>
                <span className="lab-live"><i /> PYTHON</span>
              </div>
              <div className="lab-heading">
                <div><span className="lab-kicker">PYTHON CONCEPT / {example.number}</span><strong>{example.label}</strong></div>
                <span className="lab-version">PY 3</span>
              </div>
              <div className="lab-example-caption">{example.description}</div>
              <div className="lab-editor">
                <div className="lab-line-numbers">{example.code.map((_, line) => <span key={line}>{String(line + 1).padStart(2, "0")}</span>)}</div>
                <pre>{example.code.map((line, lineIndex) => <span className="lab-code-line" key={lineIndex}>{line}</span>)}</pre>
              </div>
              <div className="lab-output">
                <div className="lab-output-heading"><span>OUTPUT</span><span className={"lab-output-status" + (hasRun && isActive ? " done" : "")}>{hasRun && isActive ? "● FINISHED" : "○ READY"}</span></div>
                <pre className={"lab-output-result" + (hasRun && isActive ? " visible" : "")}>{hasRun && isActive ? example.output : "运行示例，查看程序结果。"}</pre>
              </div>
              <div className="lab-actions">
                <button type="button" className="lab-run-button" onClick={runExample} tabIndex={isActive ? 0 : -1}><span>▶</span> 运行示例</button>
                <span className="lab-drag-hint">向左滑动切换 <b>←</b></span>
              </div>
              <div className="lab-deck-pagination">
                {examples.map((item, dotIndex) => <i key={item.id} className={active === dotIndex ? "active" : ""} />)}
                <span>{example.number} / 03</span>
              </div>
            </article>
          );
        })}
      </div>
      <div className="hero-deck-caption">
        <span>INTERACTIVE PYTHON CARDS</span>
        <span>按住卡片，向左滑动</span>
      </div>
    </section>
  );
}
