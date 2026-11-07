"use client";

import { useRef, useState } from "react";

const examples = [
  {
    id: "hello",
    label: "输出语句",
    file: "01 / print.py",
    description: "让计算机说出第一句话",
    code: ['message = "Hello, Python!"', "print(message)", 'print("欢迎来到 CODE ARCHIVE")'],
    output: "Hello, Python!\n欢迎来到 CODE ARCHIVE",
    number: "01",
    accent: "blue",
  },
  {
    id: "condition",
    label: "条件判断",
    file: "02 / condition.py",
    description: "根据条件，做出不同选择",
    code: ["score = 92", "if score >= 60:", '    print("恭喜你，成功通过！")', "else:", '    print("再接再厉！")'],
    output: "恭喜你，成功通过！",
    number: "02",
    accent: "violet",
  },
  {
    id: "loop",
    label: "循环结构",
    file: "03 / loop.py",
    description: "让一段代码重复执行",
    code: ["for number in range(1, 4):", "    print(number)", 'print("循环完成！")'],
    output: "1\n2\n3\n循环完成！",
    number: "03",
    accent: "mint",
  },
] as const;

type ExampleId = (typeof examples)[number]["id"];

export default function HeroPythonLab() {
  const [order, setOrder] = useState<number[]>([0, 1, 2]);
  const [hasRun, setHasRun] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const pointerId = useRef<number | null>(null);
  const shifted = useRef(false);

  const activeIndex = order[0];
  const activeExample = examples[activeIndex];

  function nextExample() {
    setOrder((current) => [...current.slice(1), current[0]]);
    setHasRun(false);
    setDragX(0);
    shifted.current = true;
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    startX.current = event.clientX;
    pointerId.current = event.pointerId;
    shifted.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!isDragging || pointerId.current !== event.pointerId || shifted.current) return;
    const delta = Math.min(0, event.clientX - startX.current);
    setDragX(Math.max(-150, delta));
    if (delta <= -82) nextExample();
  }

  function onPointerEnd(event: React.PointerEvent<HTMLElement>) {
    if (pointerId.current !== event.pointerId) return;
    pointerId.current = null;
    setIsDragging(false);
    setDragX(0);
  }

  function runExample() {
    setHasRun(false);
    setRunCount((count) => count + 1);
    requestAnimationFrame(() => setHasRun(true));
  }

  return (
    <section
      className={"hero-python-deck" + (isDragging ? " is-dragging" : "")}
      aria-label="Python 交互演示卡片，按住鼠标左键向左拖动切换"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <div className="python-deck-back python-deck-back-two" aria-hidden="true" />
      <div className="python-deck-back python-deck-back-one" aria-hidden="true" />
      <article
        className={"hero-code-card hero-python-lab deck-card accent-" + activeExample.accent}
        style={{ transform: `translateX(${dragX}px) rotate(${dragX / 30}deg)` }}
        key={activeExample.id}
      >
        <div className="lab-topbar">
          <div className="lab-window-dots"><i /><i /><i /></div>
          <span className="lab-file-name">{activeExample.file}</span>
          <span className="lab-live"><i /> LIVE</span>
        </div>

        <div className="lab-heading">
          <div>
            <span className="lab-kicker">PYTHON CONCEPT / {activeExample.number}</span>
            <strong>{activeExample.label}</strong>
          </div>
          <span className="lab-version">PY 3</span>
        </div>

        <div className="lab-example-caption">{activeExample.description}</div>

        <div className={"lab-editor " + (hasRun ? "is-running" : "")} key={activeExample.id + "-" + runCount}>
          <div className="lab-line-numbers">
            {activeExample.code.map((_, index) => <span key={index}>{String(index + 1).padStart(2, "0")}</span>)}
          </div>
          <pre>
            {activeExample.code.map((line, index) => (
              <span className="lab-code-line" key={index}>{line}</span>
            ))}
          </pre>
        </div>

        <div className="lab-output">
          <div className="lab-output-heading">
            <span>TERMINAL / OUTPUT</span>
            <span className={hasRun ? "lab-output-status done" : "lab-output-status"}>
              {hasRun ? "● FINISHED" : "○ READY"}
            </span>
          </div>
          <pre aria-live="polite" className={hasRun ? "lab-output-result visible" : "lab-output-result"}>
            {hasRun ? activeExample.output : "运行示例，查看程序结果。"}
          </pre>
        </div>

        <div className="lab-actions">
          <button type="button" className="lab-run-button" onClick={runExample}>
            <span>▶</span> {hasRun ? "再运行一次" : "运行示例"}
          </button>
          <span className="lab-drag-hint"><span>←</span> 按住并向左拖动</span>
        </div>
        <div className="lab-deck-pagination" aria-label={activeExample.label}>
          {examples.map((example, index) => (
            <i key={example.id} className={order[0] === index ? "active" : ""} />
          ))}
          <span>{activeExample.number} / 03</span>
        </div>
      </article>
    </section>
  );
}
